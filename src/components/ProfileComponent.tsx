import React, { useEffect, useState } from 'react';
import {getProfile} from "../../api/profile"

interface User {
  id: number,
  username: string
  profileId: number
}

interface ProfileComponentProps {
  user: User;
  onClose: () => void; // Add onClose prop
}

const ProfileComponent: React.FC<ProfileComponentProps> = ({ user, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="p-6 h-full flex flex-col bg-gray-800 text-gray-200 rounded-l-lg shadow-xl">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Profile</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition duration-200 text-3xl leading-none focus:outline-none"
          aria-label="Close profile"
        >
          &times;
        </button>
      </div>

      {loading && (
        <p className="text-center text-gray-400">Loading profile...</p>
      )}

      {error && (
        <p className="text-center text-red-400">{error}</p>
      )}

      {!loading && !error && profile && (
        <>
          <div className="flex flex-col items-center mb-6">
            <img
              src={profile.avatarUrl || `https://placehold.co/100x100/333333/FFFFFF?text=${user.username.charAt(0).toUpperCase()}`}
              alt={`${user.username}'s avatar`}
              className="w-28 h-28 rounded-full border-4 border-blue-500 mb-4 object-cover object-center"
            />
            <h3 className="text-xl font-semibold text-white mb-1">{user.username}</h3>
            <p className={`text-sm font-medium ${profile.status === 'Online' ? 'text-green-400' : 'text-yellow-400'}`}>
              {profile.status || 'Offline'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 text-gray-300">
            <div>
              <p className="font-semibold text-gray-400">Bio:</p>
              <p className="text-sm leading-relaxed">{profile.bio || 'No bio available.'}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">Member Since:</p>
              <p className="text-sm">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-400">User ID:</p>
              <p className="text-sm break-words">{user.id}</p>
            </div>
          </div>
        </>
      )}

      {!loading && !error && !profile && !user.profileId && (
        <p className="text-center text-gray-400">No profile data to display.</p>
      )}
    </div>
  );
};

export default ProfileComponent;