import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginRoute } from './routes/auth/LoginRoute';
import { PasswordRecoveryRoute } from './routes/auth/recovery/PasswordRecoveryRoute';
import { OtpVerificationRoute } from './routes/auth/recovery/OtpVerificationRoute';
import { ForcePasswordChangeRoute } from './routes/auth/recovery/ForcePasswordChangeRoute';
import { DashboardRoute } from './routes/dashboard/DashboardRoute';
import ProtectedRoute from './app/router/ProtectedRoute';

const queryClient = new QueryClient();

// This code is only for TypeScript
declare global {
    interface Window {
        __TANSTACK_QUERY_CLIENT__: import("@tanstack/react-query").QueryClient;
    }
}

// This code is for all users
window.__TANSTACK_QUERY_CLIENT__ = queryClient;

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginRoute />} />
                    <Route path="/auth/recovery" element={<PasswordRecoveryRoute />} />
                    <Route path="/auth/otp-verification" element={<OtpVerificationRoute />} />
                    <Route path="/auth/change-password" element={<ForcePasswordChangeRoute />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardRoute />} />
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
};

export default App;
