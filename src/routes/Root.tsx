import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../store/store";
import { setUserFromPersistedStorage, logout, authRequest, authFailure } from '../store/slices/authSlice';
import { verifyAuthToken } from '../../api/auth';

const Root: React.FC = () => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = authUser.token !== null;
  const isLoading = useSelector((state: RootState) => state.auth.loading);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [initialAuthChecked, setInitialAuthChecked] = React.useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUserId = localStorage.getItem('authUserId');
      const storedUsername = localStorage.getItem('authUsername');
      const storedUserEmail = localStorage.getItem('authUserEmail');

      if (storedToken && storedUserId && storedUsername && storedUserEmail) {
        if (!isLoading) {
            dispatch(authRequest());
        }

        try {
          const verifiedUser = await verifyAuthToken(storedToken);

          const payload = {
            id: verifiedUser?.id || Number(storedUserId),
            username: verifiedUser?.username || storedUsername,
            email: verifiedUser?.email || storedUserEmail,
            token: storedToken,
          };
          dispatch(setUserFromPersistedStorage(payload));
          navigate("/chat");
        } catch (error: any) {
          dispatch(logout());
        } finally {
            setInitialAuthChecked(true);
        }
      } else {
        if (isLoading) {
            dispatch(authFailure('No token found.'));
        }
        if (isAuthenticated) {
            dispatch(logout());
        }
        setInitialAuthChecked(true);
        navigate("/login");
      }
    };

    if (!initialAuthChecked) {
        initializeAuth();
    }

  }, [dispatch, isAuthenticated, isLoading, initialAuthChecked]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!initialAuthChecked) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-700 text-gray-100">
      <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">Posto</h1>
        {isAuthenticated && (
          <nav>
            <span className="mr-4 text-lg">Welcome, {authUser.username || 'User'}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-200"
            >
              Logout
            </button>
          </nav>
        )}
      </header>
      <main className="flex-grow overflow-hidden">
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-gray-400 p-3 text-center text-sm border-t border-gray-700">
        <h2>&copy; {new Date().getFullYear()} Posto. All rights reserved.</h2>
      </footer>
    </div>
  );
};

export default Root;