import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { getProfile } from '../../store/slices/authSlice';
import LoadingSpinner from '../UI/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch profile
    if (token && !isAuthenticated && !loading) {
      dispatch(getProfile() as any);
    }
  }, [dispatch, token, isAuthenticated, loading]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;