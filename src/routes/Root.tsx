import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from "../store/store"; 

const Root: React.FC = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const location = useLocation();

  //If user isnt logged in/authenticated they are sent to login
  if (!isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div>
      <header>
        <h1>Posto</h1>
        {isAuthenticated && <nav> 
          
        </nav>}
      </header>
      <main>
        <Outlet />
      </main>
      <footer>
        <h2>Posto footer</h2>
      </footer>
    </div>
  );
};

export default Root;