// src/components/AuthGuard.tsx

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { RootState } from '../store/store';

interface AuthGuardProps {}

const AuthGuard: React.FC<AuthGuardProps> = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.user.token !== null);
  const isLoading = useSelector((state: RootState) => state.auth.loading);

  const location = useLocation();

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthGuard;