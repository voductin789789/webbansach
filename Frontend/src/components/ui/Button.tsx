// src/components/ui/Button.tsx
import React, { ButtonHTMLAttributes } from 'react';
import Spinner from './Spinner';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  style,
  ...rest
}) => {
  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '16px' },
  }[size];

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#E74C3C',
      color: '#FFFFFF',
      border: '1px solid #E74C3C',
    },
    secondary: {
      backgroundColor: '#2C3E50',
      color: '#FFFFFF',
      border: '1px solid #2C3E50',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#2C3E50',
      border: '1px solid #2C3E50',
    },
    danger: {
      backgroundColor: '#DC2626',
      color: '#FFFFFF',
      border: '1px solid #DC2626',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#4B5563',
      border: '1px solid transparent',
    },
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={`app-button btn-${variant} ${className}`}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 600,
        borderRadius: '6px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.65 : 1,
        transition: 'all 0.2s ease',
        width: fullWidth ? '100%' : 'auto',
        ...sizeStyles,
        ...variantStyles[variant],
        ...style,
      }}
      {...rest}
    >
      {loading ? (
        <Spinner size={size === 'lg' ? 'md' : 'sm'} color="white" />
      ) : (
        icon && <span className="btn-icon">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};

export default Button;
