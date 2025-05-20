// src/components/AuthGuard.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';
import { store } from '../store/store'; // <--- IMPORT THE STORE HERE TOO for immediate state check

interface AuthGuardProps {}

const AuthGuard: React.FC<AuthGuardProps> = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.user.token !== null);
  const isLoading = useSelector((state: RootState) => state.auth.loading);

  const location = useLocation();

  // Log on every render of AuthGuard
  console.groupCollapsed(`AuthGuard Render - Path: ${location.pathname}`);
  console.log('   AuthGuard - isAuthenticated (from useSelector):', isAuthenticated);
  console.log('   AuthGuard - isLoading (from useSelector):', isLoading);
  console.log('   AuthGuard - Raw Redux State (store.getState()):', store.getState().auth.isAuthenticated, store.getState().auth.loading, store.getState().auth.user.username);
  console.groupEnd();


  if (isLoading) {
    console.log('AuthGuard: Still loading auth status. Rendering loading placeholder.');
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    console.log('AuthGuard: NOT authenticated. Redirecting to /login...');
    // IMPORTANT: Log the state *right before* the redirect happens
    console.log('AuthGuard: Redirecting. Current Redux state at redirect point:', store.getState().auth.isAuthenticated, store.getState().auth.loading, store.getState().auth.user.username);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('AuthGuard: AUTHENTICATED. Rendering Outlet (protected content).');
  return <Outlet />;
};

export default AuthGuard;