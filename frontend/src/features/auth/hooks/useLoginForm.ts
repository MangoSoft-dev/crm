import { useState } from 'react';
import { Form } from 'antd';
import { useLoginMutation } from '../api';
import { useAuthStore } from '../store/useAuthStore';
import { LoginCredentials, isAuthentication } from '../types';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const useLoginForm = () => {
    const { t } = useTranslation('auth');
    const [form] = Form.useForm<LoginCredentials>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const loginMutation = useLoginMutation();
    const setLoginData = useAuthStore((state) => state.setLoginData);
    const navigate = useNavigate();

    const handleSubmit = async (values: LoginCredentials) => {
        setErrorMessage(null); // Reset previous error

        try {
            const response = await loginMutation.mutateAsync(values);
            const result = response.login;

            if (isAuthentication(result)) {
                // Successful login: Save token and refreshToken in Zustand
                setLoginData(result.token, result.refreshToken);

                // You could add an onLoginSuccess callback here or let
                // the router redirect based on authStore.isAuthenticated state
                navigate('/');
            } else {
                // Failed login handled by backend (e.g. Invalid credentials)
                setErrorMessage(result.message || 'Authentication error');
            }
        } catch (error) {
            // Network error, timeout or GraphQL error (e.g. 500)
            console.error("Login Error:", error);
            setErrorMessage(error instanceof Error ? error.message : 'Unexpected error connecting to the server.');
        }
    };

    return {
        form,
        errorMessage,
        isLoading: loginMutation.isPending,
        handleSubmit
    };
};
