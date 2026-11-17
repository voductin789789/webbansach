// src/components/ui/Skeleton.tsx
import React from 'react';

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  variant?: 'text' | 'rectangular' | 'circular';
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  className = '',
  style,
}) => {
  const getDefaultStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'circular':
        return {
          width: width || '40px',
          height: height || '40px',
          borderRadius: '50%',
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || '16px',
          borderRadius: borderRadius || '4px',
        };
      case 'rectangular':
      default:
        return {
          width: width || '100%',
          height: height || '120px',
          borderRadius: borderRadius || '6px',
        };
    }
  };

  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{
        backgroundColor: '#E5E7EB',
        display: 'inline-block',
        overflow: 'hidden',
        position: 'relative',
        ...getDefaultStyles(),
        ...style,
      }}
    />
  );
};

// Component Skeleton dành riêng cho Thẻ Sách (Book Card Skeleton)
export const BookCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <Skeleton height="220px" borderRadius="6px" />
      <Skeleton variant="text" width="85%" height="18px" />
      <Skeleton variant="text" width="60%" height="14px" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <Skeleton variant="text" width="45%" height="20px" />
        <Skeleton variant="rectangular" width="36px" height="36px" borderRadius="6px" />
      </div>
    </div>
  );
};

export default Skeleton;
