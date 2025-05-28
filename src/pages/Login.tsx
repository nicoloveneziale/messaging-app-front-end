import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, authRequest, authFailure } from '../store/slices/authSlice'; 
import {loginUser} from "../../api/auth"; 

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  //Send back to
  const from = location.state?.from?.pathname || '/chat'; 

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    //Set loading state
    dispatch(authRequest()); 

 
    try {
      //api call
      const data = await loginUser(username, password);

      //set auth states
      dispatch(
        loginSuccess({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          token: data.token
        })
      )

      //resume to previous page
      navigate(from, {replace: true});
    } catch (error: any){
      dispatch(authFailure(error.message || "Login failed"))
    }
  };

  return (
    <div className="justify-items-center content-center w-full h-full">
      <div className="bg-gray-700 py-4 px-2 rounded-lg h-7/10 w-1/2 justify-items-center text-3xl">
      <h1 className='text-5xl font-bold mt-5 mb-15 border-b-4 border-gray-800 pb-4'>Login</h1>
      <form onSubmit={handleLogin} className="login-form bg-gray-800 rounded py-12 px-5 justify-items-center">
        <div className="form-group">
          <label htmlFor="username" className=' font-bold'>Username:</label>
          <br />
          <input
            type="text"
            id="username"
            className='bg-gray-100 rounded m-3 text-gray-950'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password" className='font-bold'>Password:</label>
          <br />
          <input
            type="password"
            id="password"
            className='bg-gray-100 rounded m-3 text-gray-950'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button bg-amber-600 my-3 px-12 py-2 rounded">
          Login
        </button>
        <p className="signup-link text-2xl">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </form>
      </div>
    </div>
  );
};

export default Login;