import React, { useEffect, useState } from 'react';
import {getProfile} from "../../api/profile"
import { useSelector } from 'react-redux';
import type { RootState } from "../store/store"

interface User {
  id: number,
  username: string
  profileId: number
}

interface ProfileComponentProps {
  user: User;
  onClose: () => void;
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ user, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const onlineUserIds = useSelector((state: RootState) => state.userStatus.onlineUserIds);
  const isUserOnline = onlineUserIds.includes(user.id);

  useEffect(() => {
    const getProfileForUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (user.profileId == null){
          setError("No profile ID available for this user.");
          setLoading(false);
          return;
        }
        const result = await getProfile(user.profileId, token);
        if (result && result.profile) {
          setProfile(result.profile);
        } else {
          setError("Profile not found.");
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.profileId) {
      getProfileForUser();
    } else {
      setProfile(null);
      setLoading(false);
      setError("No user or profile ID provided.");
    }
  }, [user.profileId, user]);

  if (!user) {
    return null;
  }

  return (
    <div className="
      p-6 h-full flex flex-col bg-white text-gray-800
      rounded-none border-l-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]
    ">
      <div className="
        flex justify-between items-center mb-6 pb-4
        border-b-2 border-black
      ">
        <h2 className="text-2xl font-extrabold text-black">
          Profile
        </h2>
        <button
          onClick={onClose}
          className="
            text-black hover:text-gray-600 transition duration-200
            text-4xl leading-none focus:outline-none font-thin
          "
          aria-label="Close profile"
        >
          &times;
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-700 font-mono">Loading profile...</p>
      )}

      {error && (
        <p className="text-center text-red-600 font-mono">{error}</p>
      )}

      {!loading && !error && profile && (
        <>
          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.avatarUrl || `https://placehold.co/100x100/CCCCCC/000000?text=${user.username.charAt(0).toUpperCase()}`}
              alt={`${user.username}'s avatar`}
              className="
                w-28 h-28 rounded-full border-2 border-black mb-4
                object-cover object-center shadow-[2px_2px_0px_rgba(0,0,0,1)]
              "
            />
            <h3 className="text-xl font-semibold text-black mb-1">
              {user.username}
            </h3>
            <p className={`text-sm font-semibold font-mono ${isUserOnline ? 'text-green-600' : 'text-amber-600'}`}>
              {isUserOnline ? "Online" : "Offline"}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-gray-700">
            <div>
              <p className="font-bold text-black">Bio:</p>
              <p className="text-sm leading-relaxed">{profile.bio || 'No bio available.'}</p>
            </div>
            <div>
              <p className="font-bold text-black">Member Since:</p>
              <p className="text-sm font-mono">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="font-bold text-black">User ID:</p>
              <p className="text-sm break-words font-mono">{user.id}</p>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !profile && !user.profileId && (
        <p className="text-center text-gray-700 font-mono">No profile data to display.</p>
      )}
    </div>
  );
};

export default ProfileComponent;