import React from 'react';
import { Card, Typography } from 'antd';
import './ActionCard.scss';

const { Title, Text } = Typography;

interface ActionCardProps {
    type: 'primary' | 'secondary';
    title: string;
    description: string;
    icon: React.ReactNode;
}

export const ActionCard: React.FC<ActionCardProps> = ({
    type,
    title,
    description,
    icon,
}) => {
    return (
        <Card className={`action-card ${type}`} bordered={type === 'secondary'}>
            <div className="action-card-content">
                <div className="action-text-area">
                    <Title level={4} className="action-title">{title}</Title>
                    <Text className="action-description">{description}</Text>
                </div>
                <div className="action-icon-wrapper">
                    {icon}
                </div>
            </div>
        </Card>
    );
};
