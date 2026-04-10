import React from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useForgotPasswordForm } from '../hooks';
import { ForgotPasswordValues } from '../types';
import './ForgotPasswordForm.scss';

const { Title, Text, Link } = Typography;

export const ForgotPasswordForm: React.FC = () => {
    const { t } = useTranslation('auth');
    const navigate = useNavigate();
    const { form, errorMessage, isSuccess, isLoading, handleSubmit, handleFieldsChange } = useForgotPasswordForm();

    if (isSuccess) {
        return (
            <div className="login-form-wrapper">
                <div className="login-header">
                    <Title level={2} className="login-title">{t('forgotPassword.title')}</Title>
                </div>
                <div className="forgot-success-panel">
                    <div className="success-icon">
                        <CheckCircleOutlined style={{ color: '#2E7D32', fontSize: 48 }} />
                    </div>
                    <Title level={3} className="success-title">{t('forgotPassword.successTitle')}</Title>
                    <Text className="success-message">{t('forgotPassword.successMessage')}</Text>
                    <br />
                    <Link className="back-to-login-btn" onClick={() => navigate('/login')}>
                        {t('forgotPassword.backToLogin')}
                    </Link>
                </div>

                <div className="login-footer">
                    <Text type="secondary" className="footer-credits">{t('footer.copyright')}</Text>
                    <div className="footer-links">
                        <Link type="secondary">{t('footer.help').toUpperCase()}</Link>
                        <Link type="secondary">{t('footer.privacy').toUpperCase()}</Link>
                        <Link type="secondary">{t('footer.terms').toUpperCase()}</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="login-form-wrapper">
            <div className="login-header">
                <Title level={2} className="login-title">{t('forgotPassword.title')}</Title>
                <Text className="login-subtitle">{t('forgotPassword.subtitle')}</Text>
            </div>

            {errorMessage && (
                <Alert
                    message={errorMessage}
                    type="error"
                    showIcon
                    className="login-alert"
                />
            )}

            <Form
                form={form}
                name="forgot_password_form"
                layout="vertical"
                onFinish={handleSubmit}
                onFieldsChange={handleFieldsChange}
                className="login-form"
                requiredMark={false}
            >
                <Form.Item
                    name="email"
                    label={t('forgotPassword.emailLabel')}
                    rules={[
                        { required: true, message: t('forgotPassword.requiredEmail') },
                        { type: 'email', message: t('forgotPassword.validEmail') },
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="input-icon" />}
                        placeholder={t('forgotPassword.emailPlaceholder')}
                        size="large"
                        className="login-input"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="login-submit-btn"
                        shape="round"
                        size="large"
                        loading={isLoading}
                        disabled={isLoading}
                        block
                    >
                        {isLoading ? t('forgotPassword.submitting') : t('forgotPassword.submit')}
                    </Button>
                </Form.Item>
            </Form>

            <div className="login-register-prompt">
                <Link className="register-link" onClick={() => navigate('/login')}>
                    {t('forgotPassword.backToLogin')}
                </Link>
            </div>

            <div className="login-footer">
                <Text type="secondary" className="footer-credits">{t('footer.copyright')}</Text>
                <div className="footer-links">
                    <Link type="secondary">{t('footer.help').toUpperCase()}</Link>
                    <Link type="secondary">{t('footer.privacy').toUpperCase()}</Link>
                    <Link type="secondary">{t('footer.terms').toUpperCase()}</Link>
                </div>
            </div>
        </div>
    );
};
