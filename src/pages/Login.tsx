import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, authRequest, authFailure } from '../store/slices/authSlice';
import { loginUser } from "../../api/auth";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || '/chat';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(authRequest());

    try {
      const data = await loginUser(username, password);
      dispatch(
        loginSuccess({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          token: data.token
        })
      );
      navigate(from, { replace: true });
    } catch (error: any) {
      dispatch(authFailure(error.message || "Login failed"));
    }
  };

  return (
    <div className="
      flex items-center justify-center
      w-full h-screen bg-gray-50                    {/* Matches Root's main content background */}
      font-sans antialiased                         {/* Standard sans-serif font */}
      text-gray-800                                 {/* Dark text for contrast on light background */}
    ">
      <div className="
        bg-white py-10 px-8 rounded-none               {/* Crisp white background, sharp corners for this style */}
        border-2 border-black                         {/* Strong black border */}
        shadow-[4px_4px_0px_rgba(0,0,0,1)]            {/* Distinct offset shadow like Root's buttons */}
        h-auto w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5
        text-center relative
      ">
        <h1 className="
          text-4xl md:text-5xl font-extrabold text-black 
          mb-8 pb-4
          border-b-2 border-black                     
        ">
          Login 
        </h1>

        <form onSubmit={handleLogin} className="
          bg-gray-100 rounded-none                    {/* Slightly off-white for the form section */}
          py-8 px-5
          border-2 border-black                       {/* Strong inner black border */}
          shadow-[4px_4px_0px_rgba(0,0,0,0.5)]         {/* Offset shadow for the form itself */}
        ">
          <div className="form-group mb-6">
            <label htmlFor="username" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="
                bg-white rounded-none p-3 w-3/4 max-w-sm
                text-gray-900 text-base
                border-2 border-gray-400              {/* Defined but slightly softer border for input */}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100 {/* Clean focus ring */}
                transition-all duration-200 ease-in-out
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-8">
            <label htmlFor="password" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="
                bg-white rounded-none p-3 w-3/4 max-w-sm
                text-gray-900 text-base
                border-2 border-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
                transition-all duration-200 ease-in-out
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="
            px-5 py-2 border-2 border-black             
            bg-amber-300 text-black font-bold           
            shadow-[4px_4px_0px_rgba(0,0,0,1)]          
            hover:shadow-none transition-all duration-200
            hover:translate-x-1 hover:translate-y-1     
            active:bg-amber-400                         
          ">
            Login
          </button>
          <p className="
            signup-link text-base mt-8
            text-gray-600                               
          ">
            Don't have an account? {' '}
            <a href="/register" className="
              text-blue-600 hover:text-blue-800         
              font-semibold underline                   
              transition-colors duration-200
            ">
              Sign Up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;