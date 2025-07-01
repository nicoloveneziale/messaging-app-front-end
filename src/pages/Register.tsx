import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authRequest, authFailure, loginSuccess } from '../store/slices/authSlice';
import { registerUser } from '../../api/auth';

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [repassword, setRepassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || '/chat';

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    dispatch(authRequest());

    if (password !== repassword) {
      setError("Passwords are not the same");
      dispatch(authFailure("Passwords do not match"));
      return;
    }

    try {
      const data = await registerUser(username, password, email);
      dispatch(
        loginSuccess({
            id: data.newUser.id,
            username: data.newUser.username,
            email: data.newUser.email,
            token: data.token
        })
      );
      navigate(from, {replace: true});
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      console.error("Registration error:", error);
      dispatch(authFailure(error.message || 'Registration failed'));
    }
  };

  return (
    <div className="
      flex items-center justify-center
      w-full h-screen bg-gray-50
      font-sans antialiased
      text-gray-800
    ">
      <div className="
        bg-white py-10 px-8 rounded-none
        border-2 border-black
        shadow-[4px_4px_0px_rgba(0,0,0,1)]
        h-auto w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-2/5
        text-center
      ">
        <h1 className="
          text-4xl md:text-5xl font-extrabold text-black
          mb-8 pb-4
          border-b-2 border-black
        ">
          Register
        </h1>

        <form onSubmit={handleRegister} className="
          bg-gray-100 rounded-none
          py-8 px-5
          border-2 border-black
          shadow-[4px_4px_0px_rgba(0,0,0,0.5)]
        ">
          <div className="form-group mb-6">
            <label htmlFor="username" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="
                bg-white rounded-none p-3 w-3/4 max-w-sm
                text-gray-900 text-base
                border-2 border-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
                transition-all duration-200 ease-in-out
              "
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-6">
            <label htmlFor="email" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="
                bg-white rounded-none p-3 w-3/4 max-w-sm
                text-gray-900 text-base
                border-2 border-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
                transition-all duration-200 ease-in-out
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group mb-6">
            <label htmlFor="password" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Password:
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
          <div className="form-group mb-8">
            <label htmlFor="repassword" className="
              font-semibold text-lg text-gray-800
              block mb-2
            ">
              Re-Type Password:
            </label>
            <input
              type="password"
              id="repassword"
              className="
                bg-white rounded-none p-3 w-3/4 max-w-sm
                text-gray-900 text-base
                border-2 border-gray-400
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100
                transition-all duration-200 ease-in-out
              "
              value={repassword}
              onChange={(e) => setRepassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-600 font-semibold mb-4 text-center">
              {error}
            </p>
          )}

          <button type="submit" className="
            px-5 py-2 border-2 border-black
            bg-amber-300 text-black font-bold
            shadow-[4px_4px_0px_rgba(0,0,0,1)]
            hover:shadow-none transition-all duration-200
            hover:translate-x-1 hover:translate-y-1
            active:bg-amber-400
          ">
            Sign Up
          </button>
          <p className="
            signup-link text-base mt-8
            text-gray-600
          ">
            Already have an account? {' '}
            <a href="/login" className="
              text-blue-600 hover:text-blue-800
              font-semibold underline
              transition-colors duration-200
            ">
              Log In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;