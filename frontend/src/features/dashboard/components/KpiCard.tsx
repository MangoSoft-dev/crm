import React from 'react';
import { Card, Typography } from 'antd';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import './KpiCard.scss';

const { Title, Text } = Typography;

interface KpiCardProps {
    icon: React.ReactNode;
    iconBgColor: string;
    iconColor: string;
    title: string;
    value: string;
    percentage: number;
}

export const KpiCard: React.FC<KpiCardProps> = ({
    icon,
    iconBgColor,
    iconColor,
    title,
    value,
    percentage,
}) => {
    const isPositive = percentage >= 0;

    return (
        <Card className="kpi-card" bordered={false}>
            <div className="kpi-header">
                <div
                    className="kpi-icon-wrapper"
                    style={{ backgroundColor: iconBgColor, color: iconColor }}
                >
                    {icon}
                </div>
                <div className={`kpi-indicator ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <RiseOutlined /> : <FallOutlined />}
                    <span>{isPositive ? '+' : ''}{percentage}%</span>
                </div>
            </div>

            <div className="kpi-content">
                <Text className="kpi-title">{title}</Text>
                <Title level={2} className="kpi-value">{value}</Title>
            </div>
        </Card>
    );
};
