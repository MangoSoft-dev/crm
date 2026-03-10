import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { usePasswordRecovery } from '../hooks';
import './PasswordRecoveryForm.scss';

const { Title, Text } = Typography;

export const PasswordRecoveryForm: React.FC = () => {
    const { t } = useTranslation('auth');
    const [form] = Form.useForm();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    
    const { isLoading, handleSubmit } = usePasswordRecovery();

    const handleFinish = async (values: { email: string }) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        
        try {
            await handleSubmit(values.email);
            setSuccessMessage(t('passwordRecovery.success'));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t('passwordRecovery.error'));
        }
    };

    return (
        <div className="password-recovery-form-wrapper">
            <div className="recovery-header">
                <Title level={2} className="recovery-title">{t('passwordRecovery.title')}</Title>
                <Text className="recovery-subtitle">{t('passwordRecovery.subtitle')}</Text>
            </div>

            {successMessage && (
                <Alert
                    message={successMessage}
                    type="success"
                    showIcon
                    className="recovery-alert success"
                />
            )}

            {errorMessage && (
                <Alert
                    message={errorMessage}
                    type="error"
                    showIcon
                    className="recovery-alert error"
                />
            )}

            <Form
                form={form}
                name="password_recovery_form"
                layout="vertical"
                onFinish={handleFinish}
                className="recovery-form"
                requiredMark={false}
            >
                <Form.Item
                    name="email"
                    label={t('passwordRecovery.emailLabel')}
                    rules={[
                        { required: true, message: t('passwordRecovery.requiredEmail') },
                        { type: 'email', message: t('passwordRecovery.validEmail') }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="input-icon" />}
                        placeholder={t('passwordRecovery.emailPlaceholder')}
                        size="large"
                        className="recovery-input"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="recovery-submit-btn"
                        shape="round"
                        size="large"
                        loading={isLoading}
                        block
                    >
                        {isLoading ? t('passwordRecovery.submitting') : t('passwordRecovery.submit')}
                    </Button>
                </Form.Item>
            </Form>

            <div className="recovery-back-to-login">
                <Button 
                    type="link" 
                    className="back-to-login-btn"
                    href="/login"
                >
                    {t('passwordRecovery.backToLogin')}
                </Button>
            </div>
        </div>
    );
};
