// src/components/ui/Spinner.tsx
import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'default' | 'white' | 'primary' | 'accent';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '36px',
  };

  const colorMap = {
    default: '#6B7280',
    white: '#FFFFFF',
    primary: '#2C3E50',
    accent: '#E74C3C',
  };

  const dim = sizeMap[size];
  const strokeColor = colorMap[color];

  return (
    <svg
      className={`inline-block animate-spin ${className}`}
      style={{
        width: dim,
        height: dim,
        animation: 'spin 0.8s linear infinite',
      }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={strokeColor}
        strokeWidth="3"
        strokeOpacity="0.25"
      />
      <path
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill={strokeColor}
      />
    </svg>
  );
};

export default Spinner;
