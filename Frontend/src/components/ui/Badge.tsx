// src/components/ui/Badge.tsx
import React from 'react';
import { OrderStatus } from '../../types';
import { orderStatusMap } from '../../types/badgeStatus';

export interface BadgeProps {
  status?: OrderStatus;
  children?: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  variant = 'primary',
  size = 'md',
}) => {
  if (status) {
    const config = orderStatusMap[status] || {
      label: status,
      bgColor: '#F3F4F6',
      textColor: '#374151',
      borderColor: '#E5E7EB',
    };
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: size === 'sm' ? '2px 8px' : '4px 10px',
          fontSize: size === 'sm' ? '12px' : '13px',
          fontWeight: 600,
          borderRadius: '9999px',
          backgroundColor: config.bgColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: config.textColor,
          }}
        />
        {config.label}
      </span>
    );
  }

  const variantStyles = {
    primary: { bg: '#EBF5FF', color: '#1E40AF', border: '#BFDBFE' },
    success: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
    warning: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A' },
    danger: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
    info: { bg: '#F0F9FF', color: '#075985', border: '#BAE6FD' },
    gray: { bg: '#F3F4F6', color: '#374151', border: '#E5E7EB' },
  }[variant];

  return (
    <span
      style={{
        display: 'inline-block',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        fontSize: size === 'sm' ? '12px' : '13px',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: variantStyles.bg,
        color: variantStyles.color,
        border: `1px solid ${variantStyles.border}`,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
