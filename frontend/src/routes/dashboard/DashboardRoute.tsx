import React from 'react';
import { Row, Col, Typography } from 'antd';
import {
    FileTextOutlined,
    ContainerOutlined,
    FolderOpenOutlined,
    PlusOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { KpiCard, ActivityTable, ActionCard } from '../../features/dashboard/components';

const { Title, Text } = Typography;

export const DashboardRoute: React.FC = () => {
    const { t } = useTranslation('dashboard');

    return (
        <>
            <div style={{ marginBottom: 32 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 800 }}>{t('dashboard.welcome', { user: 'Usuario' })}</Title>
                <Text style={{ color: '#8c8c8c', fontSize: 16 }}>{t('dashboard.subtitle')}</Text>
            </div>

            {/* KPI Cards */}
            <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
                <Col xs={24} md={8}>
                    <KpiCard
                        icon={<ContainerOutlined />}
                        iconBgColor="#f6ffed"
                        iconColor="#52c41a"
                        title={t('dashboard.kpi.quotes')}
                        value="1,248"
                        percentage={12.5}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <KpiCard
                        icon={<FileTextOutlined />}
                        iconBgColor="#fffbe6"
                        iconColor="#faad14"
                        title={t('dashboard.kpi.invoices')}
                        value="12"
                        percentage={-2.4}
                    />
                </Col>
                <Col xs={24} md={8}>
                    <KpiCard
                        icon={<FolderOpenOutlined />}
                        iconBgColor="#e6f4ff"
                        iconColor="#1677ff"
                        title={t('dashboard.kpi.documents')}
                        value="45"
                        percentage={5.1}
                    />
                </Col>
            </Row>

            {/* Activity Table */}
            <ActivityTable />

            {/* Action Cards Bottom */}
            <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
                <Col xs={24} md={12}>
                    <ActionCard
                        type="primary"
                        title={t('dashboard.actions.newQuote.title')}
                        description={t('dashboard.actions.newQuote.description')}
                        icon={<PlusOutlined />}
                    />
                </Col>
                <Col xs={24} md={12}>
                    <ActionCard
                        type="secondary"
                        title={t('dashboard.actions.uploadDocs.title')}
                        description={t('dashboard.actions.uploadDocs.description')}
                        icon={<UploadOutlined />}
                    />
                </Col>
            </Row>
        </>
    );
};

export default DashboardRoute;
