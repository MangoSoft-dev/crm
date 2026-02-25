import React from 'react';
import { Form, Input, Button, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useLoginForm } from '../hooks';
import './LoginForm.scss';

const { Title, Text, Link } = Typography;

export const LoginForm: React.FC = () => {
    const { t } = useTranslation('auth');
    const { form, errorMessage, isLoading, handleSubmit } = useLoginForm();

    return (
        <div className="login-form-wrapper">
            <div className="login-header">
                <Title level={2} className="login-title">{t('login.title')}</Title>
                <Text className="login-subtitle">{t('login.subtitle')}</Text>
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
                name="login_form"
                layout="vertical"
                onFinish={handleSubmit}
                className="login-form"
                requiredMark={false}
            >
                <Form.Item
                    name="username"
                    label={t('login.emailLabel')}
                    rules={[
                        { required: true, message: t('login.requiredEmail') },
                        { type: 'email', message: t('login.validEmail') }
                    ]}
                >
                    <Input
                        prefix={<MailOutlined className="input-icon" />}
                        placeholder={t('login.emailPlaceholder')}
                        size="large"
                        className="login-input"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    label={
                        <div className="password-label-container">
                            <span>{t('login.passwordLabel')}</span>
                            <Link className="forgot-password-link">{t('login.forgotPassword')}</Link>
                        </div>
                    }
                    className="password-form-item"
                    rules={[{ required: true, message: t('login.requiredPassword') }]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="input-icon" />}
                        placeholder={t('login.passwordPlaceholder')}
                        size="large"
                        iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
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
                        block
                    >
                        {isLoading ? t('login.submitting') : t('login.submit')}
                    </Button>
                </Form.Item>
            </Form>

            <div className="login-register-prompt">
                <Text>{t('login.noAccount')} <Link className="register-link">{t('login.register')}</Link></Text>
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
