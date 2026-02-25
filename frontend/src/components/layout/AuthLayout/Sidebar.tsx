import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
    BarChartOutlined,
    ContainerOutlined,
    FolderOpenOutlined,
    SettingOutlined,
    QuestionCircleOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../../features/auth';
import './Sidebar.scss';

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
    const logout = useAuthStore((state) => state.logout);
    const { t } = useTranslation('layout');

    return (
        <Sider width={280} className="dashboard-sidebar" theme="light">
            <div className="sidebar-logo-container">
                <div className="logo-icon-box">
                    <BarChartOutlined className="logo-icon" />
                </div>
                <div className="logo-text">
                    <span className="logo-title">E-Services</span>
                    <span className="logo-subtitle">INGENIOSOFT</span>
                </div>
            </div>

            <div className="sidebar-menu-wrapper">
                <Menu
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    className="sidebar-menu-main"
                >
                    <Menu.Item key="1" icon={<ContainerOutlined />} className="custom-menu-item">
                        {t('layout.sidebar.quotes')}
                    </Menu.Item>
                    <Menu.Item key="2" icon={<ContainerOutlined />} className="custom-menu-item">
                        {t('layout.sidebar.billing')}
                    </Menu.Item>
                    <Menu.Item key="3" icon={<FolderOpenOutlined />} className="custom-menu-item">
                        {t('layout.sidebar.docs')}
                    </Menu.Item>
                </Menu>

                <div className="sidebar-config-section">
                    <div className="config-title">{t('layout.sidebar.config')}</div>
                    <Menu mode="inline" selectable={false} className="sidebar-menu-main">
                        <Menu.Item key="c1" icon={<SettingOutlined />} className="custom-menu-item config-item">
                            {t('layout.sidebar.settings')}
                        </Menu.Item>
                        <Menu.Item key="c2" icon={<QuestionCircleOutlined />} className="custom-menu-item config-item">
                            {t('layout.sidebar.support')}
                        </Menu.Item>
                    </Menu>
                </div>
            </div>

            <div className="sidebar-footer">
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    className="logout-button"
                    onClick={logout}
                    block
                >
                    {t('layout.sidebar.logout')}
                </Button>
            </div>
        </Sider>
    );
};
