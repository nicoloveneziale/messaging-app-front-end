import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authRequest, authFailure, loginSuccess } from '../store/slices/authSlice'; // Adjust path as needed
import { registerUser } from '../../api/auth'; 

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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

    try {
      const data = await registerUser(username, password, email);
      dispatch(
        loginSuccess({
            id: data.newUser.id,
            username: data.newUser.username,
            email: data.newUser.email,
            token: data.token
        })
        )
      navigate(from, {replace: true});
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      dispatch(authFailure(error.message || 'Registration failed')); 
    }
  };

  return (
    <div className="register-container">
      <h1>Sign Up</h1>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleRegister} className="register-form">
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
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <button type="submit" className="register-button">
          Sign Up
        </button>
        <p className="login-link">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </form>
    </div>
  );
};

export default Register;