import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from "../store/store";
import { setUserFromPersistedStorage, logout, authRequest } from '../store/slices/authSlice';
import { verifyAuthToken } from '../../api/auth';

const ModernLoader: React.FC = () => (
  <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#333">
    <g fill="none" fillRule="evenodd" strokeWidth="2">
      <circle cx="22" cy="22" r="1">
        <animate attributeName="r"
          begin="0s" dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite" />
        <animate attributeName="stroke-opacity"
          begin="0s" dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite" />
      </circle>
      <circle cx="22" cy="22" r="1">
        <animate attributeName="r"
          begin="-0.9s" dur="1.8s"
          values="1; 20"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.165, 0.84, 0.44, 1"
          repeatCount="indefinite" />
        <animate attributeName="stroke-opacity"
          begin="-0.9s" dur="1.8s"
          values="1; 0"
          calcMode="spline"
          keyTimes="0; 1"
          keySplines="0.3, 0.61, 0.355, 1"
          repeatCount="indefinite" />
      </circle>
    </g>
  </svg>
);

const Root: React.FC = () => {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const isAuthenticated = !!authUser.token;
  const isLoading = useSelector((state: RootState) => state.auth.loading);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [initialAuthChecked, setInitialAuthChecked] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        dispatch(authRequest());
        try {
          const verifiedUser = await verifyAuthToken(storedToken);
          dispatch(setUserFromPersistedStorage({ ...verifiedUser, token: storedToken }));
          navigate("/chat");
        } catch (error) {
          dispatch(logout());
          navigate("/login");
        } finally {
          setInitialAuthChecked(true);
        }
      } else {
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
  }, [dispatch, navigate, isAuthenticated, initialAuthChecked]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (!initialAuthChecked || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-800">
        <ModernLoader />
        <p className="mt-4 text-lg font-mono tracking-wider animate-pulse">Initializing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white font-sans antialiased">
      <header className="
        bg-white text-gray-900
        p-4 border-b-2 border-black
        flex justify-between items-center
        sticky top-0 z-20
      ">
        <h1 className="text-3xl font-extrabold tracking-tighter text-black uppercase">
          Posto
        </h1>
        {isAuthenticated && (
          <nav className="flex items-center gap-4">
            <span className="text-md text-gray-600 hidden sm:inline">
              Welcome, <span className="font-bold">{authUser.username || 'User'}</span>
            </span>
            <button
              onClick={handleLogout}
              className="
                px-5 py-2 border-2 border-black
                bg-amber-300 text-black font-bold
                shadow-[4px_4px_0px_rgba(0,0,0,1)]
                hover:shadow-none transition-all duration-200
                hover:translate-x-1 hover:translate-y-1
                active:bg-amber-400
              "
            >
              Sign Out
            </button>
          </nav>
        )}
      </header>

      <main className="flex-grow overflow-y-auto bg-gray-50">
        <div className="p-4 sm:p-6 lg:p-8 h-full">
            <Outlet />
        </div>
      </main>

      <footer className="bg-black text-white p-3 text-center text-xs sm:text-sm relative z-10">
        <p className="font-mono tracking-wide">
          &copy; {new Date().getFullYear()} Posto. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Root;