import React, { useEffect } from 'react';
import { Layout } from 'antd';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Outlet } from 'react-router-dom';
import { useUserInfoQuery, useUserStore } from '../../../features/user';
import './AuthLayout.scss';

const { Content } = Layout;

export const AuthLayout: React.FC = () => {
    const { getUserInfo, isLoading } = useUserInfoQuery();
    const setUser = useUserStore((state) => state.setUser);

    useEffect(() => {
        if (!isLoading && getUserInfo) {
            setUser(getUserInfo);
        }
    }, [isLoading, getUserInfo, setUser]);

    return (
        <Layout className="dashboard-main-layout">
            {/* Fixed 280px Sidebar */}
            <Sidebar />

            {/* All content to the right of the sidebar */}
            <Layout className="dashboard-main-container">
                <TopHeader />

                {/* We use Layout.Content for the content outlet */}
                <Content className="dashboard-content-area">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
