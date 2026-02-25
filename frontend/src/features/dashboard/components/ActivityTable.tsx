import React from 'react';
import { Table, Typography, Tag, Space } from 'antd';
import { FileTextOutlined, ContainerOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import './ActivityTable.scss';

const { Text } = Typography;

interface ActivityRecord {
    key: string;
    type: 'cotizacion' | 'factura';
    id: string;
    client: string;
    date: string;
    status: 'aprobado' | 'pendiente' | 'enviado';
    amount: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const ActivityTable: React.FC = () => {
    const { t } = useTranslation('dashboard');

    // Mock data based on the design
    const data: ActivityRecord[] = [
        {
            key: '1',
            type: 'cotizacion',
            id: 'COT-2023-012',
            client: 'Tech Solutions Inc.',
            date: '24 Oct, 2023',
            status: 'aprobado',
            amount: 1250.0,
        },
        {
            key: '2',
            type: 'factura',
            id: 'FAC-2023-089',
            client: 'Global Logistics',
            date: '23 Oct, 2023',
            status: 'pendiente',
            amount: 3420.5,
        },
        {
            key: '3',
            type: 'cotizacion',
            id: 'COT-2023-015',
            client: 'Creative Agency',
            date: '22 Oct, 2023',
            status: 'enviado',
            amount: 890.0,
        },
    ];

    const columns = [
        {
            title: t('dashboard.activity.columns.description'),
            dataIndex: 'description',
            key: 'description',
            render: (_: any, record: ActivityRecord) => (
                <div className="activity-cell-desc">
                    <div className={`activity-icon ${record.type}`}>
                        {record.type === 'cotizacion' ? <ContainerOutlined /> : <FileTextOutlined />}
                    </div>
                    <div className="activity-info">
                        <span className="activity-title">
                            {record.type === 'cotizacion' ? t('dashboard.activity.types.quote') : t('dashboard.activity.types.invoice')} #{record.id}
                        </span>
                        <span className="activity-client">{t('dashboard.activity.client')} {record.client}</span>
                    </div>
                </div>
            ),
        },
        {
            title: t('dashboard.activity.columns.date'),
            dataIndex: 'date',
            key: 'date',
            render: (text: string) => <Text className="activity-date">{text}</Text>,
        },
        {
            title: t('dashboard.activity.columns.status'),
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => {
                let color = '';
                let text = '';
                if (status === 'aprobado') {
                    color = 'success';
                    text = t('dashboard.activity.statuses.approved');
                } else if (status === 'pendiente') {
                    color = 'warning';
                    text = t('dashboard.activity.statuses.pending');
                } else {
                    color = 'processing';
                    text = t('dashboard.activity.statuses.sent');
                }

                return (
                    <Tag color={color} className={`status-badge ${status}`}>
                        {text}
                    </Tag>
                );
            },
        },
        {
            title: t('dashboard.activity.columns.amount'),
            dataIndex: 'amount',
            key: 'amount',
            align: 'right' as const,
            render: (amount: number) => <span className="activity-amount">{formatCurrency(amount)}</span>,
        },
    ];

    return (
        <div className="activity-table-wrapper">
            <div className="activity-header-row">
                <Typography.Title level={4} className="activity-main-title">{t('dashboard.activity.title')}</Typography.Title>
                <Typography.Link className="activity-view-all">{t('dashboard.activity.viewAll')}</Typography.Link>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                className="custom-activity-table"
            />
        </div>
    );
};
