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
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-button">
          Login
        </button>
        <p className="signup-link">
          Don't have an account? <a href="/register">Sign Up</a>
        </p>
      </form>
    </div>
  );
};

export default Login;