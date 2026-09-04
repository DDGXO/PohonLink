'use client';

import React, { useEffect } from 'react';

export interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info' | 'danger';
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type = 'success',
  duration = 3200,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error' || type === 'danger';

  const icon = isSuccess ? '✓' : isError ? '✕' : 'ℹ';
  const accentColor = isSuccess ? '#4ade80' : isError ? '#f87171' : '#38bdf8';
  const bgColor = isSuccess
    ? 'rgba(74, 222, 128, 0.12)'
    : isError
    ? 'rgba(239, 68, 68, 0.12)'
    : 'rgba(56, 189, 248, 0.12)';
  const borderColor = isSuccess
    ? 'rgba(74, 222, 128, 0.35)'
    : isError
    ? 'rgba(239, 68, 68, 0.35)'
    : 'rgba(56, 189, 248, 0.35)';

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: '#121212',
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '12px 18px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'slideUpToast 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: bgColor,
          border: `1px solid ${borderColor}`,
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      <span
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: '#ffffff',
          lineHeight: 1.4,
        }}
      >
        {message}
      </span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#888888',
          fontSize: '16px',
          lineHeight: 1,
          cursor: 'pointer',
          padding: '2px 4px',
          marginLeft: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>

      <style jsx>{`
        @keyframes slideUpToast {
          from {
            transform: translateY(16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
