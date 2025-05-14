import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, authRequest, authFailure } from '../store/slices/authSlice'; 

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [identifier, setIdentifier] = useState(''); 
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
      // Replace this API
      const response = {ok: true};

      if (response.ok) {
        const data = await response.json();
        dispatch(
          loginSuccess({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            token: data.token,
          })
        );
        //Redirect successful login
        navigate(from, { replace: true });
      } else {
        const errorData = await response.json();
        dispatch(authFailure(errorData.message || 'Login failed'));
      }
    } catch (error: any) {
      dispatch(authFailure(error.message || 'Network error'));
    }
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="identifier">Username or Email:</label>
          <input
            type="text"
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
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