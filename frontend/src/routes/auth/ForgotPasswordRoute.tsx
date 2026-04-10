import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginLayout, ForgotPasswordForm, useAuthStore } from '../../features/auth';

export const ForgotPasswordRoute: React.FC = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return (
        <LoginLayout>
            <ForgotPasswordForm />
        </LoginLayout>
    );
};

export default ForgotPasswordRoute;
