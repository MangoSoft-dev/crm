import { useState } from 'react';
import { Form } from 'antd';
import { useRecoveryPasswordMutation } from '../api';
import { ForgotPasswordValues } from '../types';
import { useTranslation } from 'react-i18next';

export const useForgotPasswordForm = () => {
    const { t } = useTranslation('auth');
    const [form] = Form.useForm<ForgotPasswordValues>();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const recoveryMutation = useRecoveryPasswordMutation();

    const handleSubmit = async (values: ForgotPasswordValues) => {
        setErrorMessage(null);

        try {
            await recoveryMutation.mutateAsync(values);
            setIsSuccess(true);
        } catch (error) {
            setErrorMessage(
                error instanceof Error ? error.message : t('forgotPassword.networkError')
            );
        }
    };

    const handleFieldsChange = () => {
        setErrorMessage(null);
    };

    return {
        form,
        errorMessage,
        isSuccess,
        isLoading: recoveryMutation.isPending,
        handleSubmit,
        handleFieldsChange,
    };
};
