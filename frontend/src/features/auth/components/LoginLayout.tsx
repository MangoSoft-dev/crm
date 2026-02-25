import React from 'react';
import { useTranslation } from 'react-i18next';
import './LoginLayout.scss';

interface LoginLayoutProps {
    children: React.ReactNode;
}

export const LoginLayout: React.FC<LoginLayoutProps> = ({ children }) => {
    const { t } = useTranslation('auth');

    return (
        <div className="login-layout-container">
            {/* Left Side - Hero/Branding */}
            <div className="login-hero-section">
                <div className="hero-content-glass">
                    <div className="hero-logo-icon">✿</div> {/* Replace with real Logo SVG */}
                    <h1 className="hero-title">
                        {t('hero.title')}<br />{t('hero.titleHighlight')}
                    </h1>
                    <p className="hero-subtitle">
                        {t('hero.description')}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="login-form-section">
                {children}
            </div>
        </div>
    );
};
