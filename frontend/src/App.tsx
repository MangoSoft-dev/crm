import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginRoute } from './routes/auth/LoginRoute';
import { DashboardRoute } from './routes/dashboard/DashboardRoute';
import ProtectedRoute from './app/router/ProtectedRoute';

const queryClient = new QueryClient();

const App: React.FC = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginRoute />} />

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
