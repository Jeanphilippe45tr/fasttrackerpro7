import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, Role } from '@/context/AuthContext';

export const RoleRoute: React.FC<{ role: Role; children: React.ReactNode }> = ({ role, children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'super_admin' ? '/super-admin/dashboard' : '/admin/dashboard'} replace />;
  }
  return <>{children}</>;
};