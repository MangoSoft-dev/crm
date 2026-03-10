import React, { useState } from 'react';
import { Form, Input, Button, Typography, Alert, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useOTPVerification } from '../hooks';
import './OtpVerificationScreen.scss';

const { Title, Text } = Typography;

export const OtpVerificationScreen: React.FC = () => {
    const { t } = useTranslation('auth');
    const [form] = Form.useForm();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [resendLoading, setResendLoading] = useState(false);
    
    const { isLoading, handleSubmit, handleResendCode } = useOTPVerification();

    const handleFinish = async (values: { code: string }) => {
        setSuccessMessage(null);
        setErrorMessage(null);
        
        try {
            await handleSubmit(values.code);
            setSuccessMessage(t('otpVerification.success'));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t('otpVerification.error'));
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await handleResendCode();
            setSuccessMessage(t('otpVerification.codeResent'));
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : t('otpVerification.resendError'));
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="otp-verification-wrapper">
            <div className="verification-header">
                <Title level={2} className="verification-title">{t('otpVerification.title')}</Title>
                <Text className="verification-subtitle">{t('otpVerification.subtitle')}</Text>
            </div>

            {successMessage && (
                <Alert
                    message={successMessage}
                    type="success"
                    showIcon
                    className="verification-alert success"
                />
            )}

            {errorMessage && (
                <Alert
                    message={errorMessage}
                    type="error"
                    showIcon
                    className="verification-alert error"
                />
            )}

            <Form
                form={form}
                name="otp_verification_form"
                layout="vertical"
                onFinish={handleFinish}
                className="verification-form"
                requiredMark={false}
            >
                <Form.Item
                    name="code"
                    label={t('otpVerification.codeLabel')}
                    rules={[
                        { required: true, message: t('otpVerification.requiredCode') },
                        { pattern: /^\d{6}$/, message: t('otpVerification.validCode') }
                    ]}
                >
                    <Input
                        prefix={<LockOutlined className="input-icon" />}
                        placeholder={t('otpVerification.codePlaceholder')}
                        size="large"
                        className="verification-input"
                        maxLength={6}
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="verification-submit-btn"
                        shape="round"
                        size="large"
                        loading={isLoading}
                        block
                    >
                        {isLoading ? t('otpVerification.submitting') : t('otpVerification.submit')}
                    </Button>
                </Form.Item>
            </Form>

            <div className="verification-resend-section">
                <Space>
                    <Text>{t('otpVerification.didntReceiveCode')}</Text>
                    <Button 
                        type="link" 
                        className="resend-code-btn"
                        onClick={handleResend}
                        loading={resendLoading}
                    >
                        {t('otpVerification.resendCode')}
                    </Button>
                </Space>
            </div>

            <div className="verification-back-to-login">
                <Button 
                    type="link" 
                    className="back-to-login-btn"
                    href="/login"
                >
                    {t('otpVerification.backToLogin')}
                </Button>
            </div>
        </div>
    );
};
