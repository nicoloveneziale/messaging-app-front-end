import React, { useEffect, useState } from 'react';
import {getProfile} from "../../api/profile"

interface User {
  id: number,
  username: string
  profileId: number
}

const ProfileComponent: React.FC<User> = ({ user }) => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {

    const getProfileForUser = async() => {
      const token = localStorage.getItem("authToken")
      if (user.profileId == null){
        return;
      }
      const profile = await getProfile(user.profileId, token)
      setProfile(profile.profile);
      console.log(profile)
    }

    getProfileForUser();
    }
    ,[user.profileId])

  return (
    <div>
      <img src={profile?.avatarUrl} alt="avatar" />
      <p>{user.username}</p>
      <p>{profile?.bio}</p>
      <p>Created on {profile?.createdAt}</p>
    </div>
  )
 }
 
 export default ProfileComponent;