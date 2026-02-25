import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth';
import { AuthLayout } from '../../components/layout/AuthLayout';

export const ProtectedRoute: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (!isAuthenticated) {
        // If not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    // If logged in, render the main layout with child routes inside
    return <AuthLayout />;
};

export default ProtectedRoute;
