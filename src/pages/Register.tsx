import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authRequest, authFailure, loginSuccess } from '../store/slices/authSlice'; // Adjust path as needed
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

    if (password !== repassword){
      setError("Passwords are not the same")
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
        )
      navigate(from, {replace: true});
    } catch (error: any) {
      setError(error.message || 'Registration failed');
      console.log(error)
      dispatch(authFailure(error.message || 'Registration failed')); 
    }
  };

  return (
    <div className="justify-items-center content-center w-full h-full">
      <div className="bg-gray-700 py-4 px-2 rounded-lg h-85/100 w-1/2 justify-items-center text-3xl">
      <h1 className='text-5xl font-bold mt-5 mb-15 border-b-4 border-gray-800 pb-4'>Register</h1>
      <form onSubmit={handleRegister} className="login-form bg-gray-800 max-h-8/10 min-w-8/10 rounded py-12 px-5 justify-items-center">
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
          <label htmlFor="email" className='font-bold'>Email:</label>
          <br />
          <input
            type="email"
            id="email"
            className='bg-gray-100 rounded m-3 text-gray-950'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <div className="form-group">
          <label htmlFor="repassword" className='font-bold'>Re-Type Password:</label>
          <br />
          <input
            type="password"
            id="repassword"
            className='bg-gray-100 rounded m-3 text-gray-950'
            value={repassword}
            onChange={(e) => setRepassword(e.target.value)}
            required
          />
        </div>
        <p>{error}</p>
        <button type="submit" className="login-button bg-amber-600 my-3 px-12 py-2 rounded">
          Sign Up
        </button>
        <p className="signup-link text-2xl">
          Already have an account? <a href="/login">Log In</a>
        </p>
      </form>
      </div>
    </div>
  );
};

export default Register;