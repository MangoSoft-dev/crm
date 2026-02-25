import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginLayout, LoginForm, useAuthStore } from '../../features/auth';

export const LoginRoute: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    // If already authenticated, redirect directly to the dashboard (root)
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <LoginLayout>
            <LoginForm />
        </LoginLayout>
    );
};

export default LoginRoute;
