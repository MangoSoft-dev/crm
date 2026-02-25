import React from 'react';
import { Layout, Input, Badge, Avatar, Dropdown } from 'antd';
import { SearchOutlined, BellFilled, UserOutlined, GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './TopHeader.scss';

const { Header } = Layout;

export const TopHeader: React.FC = () => {
    const { t, i18n } = useTranslation('layout');

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const languageMenu = {
        items: [
            { key: 'es', label: 'Español (ES)', onClick: () => changeLanguage('es') },
            { key: 'en', label: 'English (EN)', onClick: () => changeLanguage('en') },
        ]
    };

    return (
        <Header className="dashboard-top-header">
            <div className="header-search">
                <Input
                    size="large"
                    placeholder={t('layout.header.searchPlaceholder')}
                    prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                    className="search-input"
                />
            </div>

            <div className="header-actions">
                {/* Language Switcher */}
                <Dropdown menu={languageMenu} placement="bottomRight" trigger={['click']}>
                    <div className="language-switcher-wrapper" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GlobalOutlined style={{ fontSize: '18px', color: '#8c8c8c' }} />
                        <span style={{ fontWeight: 600, color: '#595959' }}>{i18n.language.toUpperCase()}</span>
                    </div>
                </Dropdown>

                <Badge dot color="#2E7D32" offset={[-4, 4]}>
                    <div className="notification-icon-wrapper">
                        <BellFilled className="notification-icon" />
                    </div>
                </Badge>

                <div className="user-profile-section">
                    <div className="user-info">
                        <span className="user-name">Usuario Demo</span>
                        <span className="user-role">{t('layout.header.role')}</span>
                    </div>
                    <Avatar size={40} icon={<UserOutlined />} className="user-avatar" src="https://ui-avatars.com/api/?name=Usuario+Demo&background=f0f0f0&color=2E7D32" />
                </div>
            </div>
        </Header>
    );
};
