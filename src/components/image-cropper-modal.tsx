'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  imageSrc: string;
  aspectRatio: number; // e.g. 1 for avatar (1:1), 16/9 or 9/16 for background
  circularCrop?: boolean;
  title?: string;
  onCrop: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

export default function ImageCropperModal({
  imageSrc,
  aspectRatio = 1,
  circularCrop = false,
  title = 'Crop Gambar',
  onCrop,
  onCancel,
}: Props) {
  const [zoom, setZoom] = useState(1);
  const [isCircle, setIsCircle] = useState(circularCrop);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const initialOffset = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    initialOffset.current = { ...offset };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setOffset({
      x: initialOffset.current.x + dx,
      y: initialOffset.current.y + dy,
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      initialOffset.current = { ...offset };
    }
  };

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragStart.current.x;
    const dy = e.touches[0].clientY - dragStart.current.y;
    setOffset({
      x: initialOffset.current.x + dx,
      y: initialOffset.current.y + dy,
    });
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  const handlePerformCrop = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    const outputWidth = circularCrop ? 512 : Math.min(1920, img.naturalWidth);
    const outputHeight = outputWidth / aspectRatio;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Scale calculation
    const containerAspect = containerRect.width / containerRect.height;
    const imgAspect = img.naturalWidth / img.naturalHeight;

    let displayedWidth = containerRect.width;
    let displayedHeight = containerRect.height;

    if (imgAspect > containerAspect) {
      displayedHeight = containerRect.height;
      displayedWidth = displayedHeight * imgAspect;
    } else {
      displayedWidth = containerRect.width;
      displayedHeight = displayedWidth / imgAspect;
    }

    ctx.save();
    ctx.translate(outputWidth / 2 + offset.x * (outputWidth / containerRect.width), outputHeight / 2 + offset.y * (outputHeight / containerRect.height));
    ctx.scale(zoom, zoom);
    ctx.drawImage(
      img,
      -outputWidth / 2,
      -outputHeight / 2,
      outputWidth,
      outputHeight
    );
    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) onCrop(blob);
    }, 'image/webp', 0.92);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div style={{
        background: 'var(--surface, #141414)',
        border: '1px solid var(--border, #262626)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border, #262626)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text, #fff)', margin: 0 }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => setIsCircle(true)}
                style={{
                  padding: '4px 10px',
                  background: isCircle ? 'var(--accent, #4ade80)' : 'transparent',
                  color: isCircle ? '#000' : 'var(--text-dim, #888)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ⚪ Bulat
              </button>
              <button
                type="button"
                onClick={() => setIsCircle(false)}
                style={{
                  padding: '4px 10px',
                  background: !isCircle ? 'var(--accent, #4ade80)' : 'transparent',
                  color: !isCircle ? '#000' : 'var(--text-dim, #888)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔲 Kotak
              </button>
            </div>
            <button
              onClick={onCancel}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-dim, #888)',
                fontSize: '18px',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Crop Viewport */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              width: '100%',
              maxWidth: '360px',
              aspectRatio: `${aspectRatio}`,
              maxHeight: '360px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: isCircle ? '50%' : '12px',
              border: '2px solid var(--accent, #4ade80)',
              background: '#000',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              touchAction: 'none',
            }}
          >
            {/* Image being dragged/zoomed */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isDragging ? 'none' : 'transform 0.05s ease-out',
              }}
            />

            {/* Grid overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              border: '1px dashed rgba(255,255,255,0.25)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gridTemplateRows: '1fr 1fr 1fr',
            }}>
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ borderRight: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
          </div>

          {/* Zoom controls */}
          <div style={{ width: '100%', maxWidth: '360px', marginTop: '18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-dim, #888)' }}>🔍</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--accent, #4ade80)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '12px', color: 'var(--text-dim, #888)', width: '36px', textAlign: 'right' }}>
              {Math.round(zoom * 100)}%
            </span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-dim, #888)', margin: '8px 0 0', textAlign: 'center' }}>
            Geser gambar untuk menyesuaikan posisi
          </p>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border, #262626)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: 'rgba(0,0,0,0.2)',
        }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '9px 16px',
              background: 'transparent',
              border: '1px solid var(--border, #262626)',
              borderRadius: '8px',
              color: 'var(--text-muted, #aaa)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handlePerformCrop}
            style={{
              padding: '9px 20px',
              background: 'var(--accent, #4ade80)',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Terapkan & Unggah
          </button>
        </div>
      </div>
    </div>
  );
}
