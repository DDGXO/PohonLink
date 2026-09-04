'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface Props {
  url: string;
  username: string;
}

export default function QRCodeCard({ url, username }: Props) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    }).then(setDataUrl).catch(() => {});
  }, [url]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pohonlink-qr-${username}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '10px',
      padding: '24px',
    }}>
      <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
        Kode QR Profil
      </h2>
      <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>
        Unduh kode QR profil kamu untuk dicetak pada kemasan produk, stiker, kartu nama, atau banner.
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {dataUrl ? (
          <div style={{
            background: '#ffffff',
            padding: '12px',
            borderRadius: '8px',
            display: 'inline-flex',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}>
            <img src={dataUrl} alt={`QR Code ${username}`} style={{ width: '140px', height: '140px', display: 'block' }} />
          </div>
        ) : (
          <div style={{ width: '164px', height: '164px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }} />
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '200px' }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>Tautan Profil:</span>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)', margin: '2px 0 0', wordBreak: 'break-all' }}>
              {url}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownload}
              style={{
                padding: '9px 16px',
                background: 'var(--accent)',
                color: '#000000',
                borderRadius: '6px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📥 Unduh PNG
            </button>
            <button
              type="button"
              onClick={handleCopyLink}
              style={{
                padding: '9px 16px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Tersalin!' : '📋 Salin Tautan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
