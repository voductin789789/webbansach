// src/components/ui/Input.tsx
import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, leftIcon, rightIcon, className = '', style, id, ...rest },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: 600,
            color: '#2C3E50',
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftIcon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
              color: '#9CA3AF',
            }}
          >
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          ref={ref}
          className={`app-input ${className}`}
          style={{
            width: '100%',
            padding: '10px 14px',
            paddingLeft: leftIcon ? '38px' : '14px',
            paddingRight: rightIcon ? '38px' : '14px',
            fontSize: '14px',
            borderRadius: '6px',
            border: `1px solid ${error ? '#EF4444' : '#D1D5DB'}`,
            outline: 'none',
            backgroundColor: '#FFFFFF',
            color: '#1F2937',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            ...style,
          }}
          {...rest}
        />

        {rightIcon && (
          <div
            style={{
              position: 'absolute',
              right: '12px',
              display: 'flex',
              alignItems: 'center',
              color: '#9CA3AF',
            }}
          >
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#EF4444' }}>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>
          {helperText}
        </p>
      )}
    </div>
  );
});

export default Input;
