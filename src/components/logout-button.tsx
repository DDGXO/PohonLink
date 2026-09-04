'use client';

import { useState, useTransition } from 'react';
import { signOut } from '@/app/actions';

interface Props {
  variant?: 'sidebar' | 'topbar' | 'drawer';
  label?: string;
}

export default function LogoutButton({ variant = 'sidebar', label }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirmLogout = () => {
    startTransition(async () => {
      // Clear any client storage tokens if any
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.clear();
        } catch {}
      }
      await signOut();
    });
  };

  const getButtonContent = () => {
    if (variant === 'topbar') {
      return (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            padding: '4px 8px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-dim)',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {label || 'Keluar'}
        </button>
      );
    }

    if (variant === 'drawer') {
      return (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: 'rgba(255, 77, 77, 0.08)',
            border: '1px solid rgba(255, 77, 77, 0.25)',
            borderRadius: '8px',
            color: 'var(--danger)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
          }}
        >
          {label || 'Keluar dari Akun'}
        </button>
      );
    }

    // Default: sidebar
    return (
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          width: '100%',
          padding: '8px 12px',
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          color: 'var(--text-dim)',
          fontSize: '12px',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'all 0.15s ease',
        }}
      >
        {label || 'Keluar'}
      </button>
    );
  };

  return (
    <>
      {getButtonContent()}

      {/* Confirmation Modal */}
      {showModal && (
        <div
          onClick={() => !isPending && setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              background: 'var(--bg2)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{ fontSize: '22px' }}>🚪</span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                Konfirmasi Keluar
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-dim)', lineHeight: 1.5, margin: '0 0 20px' }}>
              Apakah kamu yakin ingin keluar dari akun? Sesi login kamu akan diakhiri dan seluruh data otentikasi akan dibersihkan.
            </p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={isPending}
                style={{
                  padding: '9px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-dim)',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isPending}
                style={{
                  padding: '9px 18px',
                  background: 'var(--danger)',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                }}
              >
                {isPending ? 'Keluar...' : 'Ya, Keluar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
