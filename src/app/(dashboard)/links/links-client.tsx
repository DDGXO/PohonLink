'use client';

import { useState, useTransition, useRef } from 'react';
import type { Link, LinkType } from '@/types/database';
import {
  createLink,
  updateLink,
  deleteLink,
  toggleLinkActive,
  toggleLinkPinned,
  reorderLinks,
} from '@/app/actions';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const BLOCK_TYPES: { type: LinkType | 'spotify' | 'youtube' | 'apple_music'; icon: string; label: string; desc: string }[] = [
  { type: 'link', icon: '🔗', label: 'Link Standar', desc: 'Tombol link ke website / portfolio' },
  { type: 'spotify', icon: '🎵', label: 'Spotify Embed', desc: 'Player lagu, album, atau playlist Spotify' },
  { type: 'youtube', icon: '▶️', label: 'YouTube Video', desc: 'Embed video player YouTube atau Shorts' },
  { type: 'apple_music', icon: '🍎', label: 'Apple Music', desc: 'Player lagu & album Apple Music' },
  { type: 'heading', icon: '📝', label: 'Heading Pembatas', desc: 'Judul pemisah seksi antar link' },
  { type: 'spacer', icon: '↕️', label: 'Spacer Jarak', desc: 'Jarak kosong antar link (custom px)' },
  { type: 'text', icon: '📄', label: 'Teks / Pengumuman', desc: 'Paragraf catatan bebas' },
  { type: 'html', icon: '💻', label: 'Custom HTML', desc: 'Widget iframe atau kode HTML custom' },
  { type: 'email', icon: '📧', label: 'Email (mailto:)', desc: 'Tombol kontak kirim email langsung' },
  { type: 'telephone', icon: '📞', label: 'Telepon (tel:)', desc: 'Tombol kontak panggilan telepon' },
];

interface Props {
  initialLinks: Link[];
  userId: string;
  username: string;
}

interface SortableItemProps {
  link: Link;
  editingId: string | null;
  isPending: boolean;
  inputStyle: React.CSSProperties;
  getLinkIcon: (link: Link) => string;
  getLinkPreview: (link: Link) => string;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, cur: boolean) => void;
  onTogglePin: (id: string, cur: boolean) => void;
}

function SortableItem({
  link,
  editingId,
  isPending,
  inputStyle,
  getLinkIcon,
  getLinkPreview,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleActive,
  onTogglePin,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const meta = (link.custom_css as Record<string, unknown> | null) || {};
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLocked, setIsLocked] = useState(Boolean(meta.is_locked));
  const [lockType, setLockType] = useState<string>((meta.lock_type as string) || 'pin');

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--surface)',
    border: isDragging ? '1px solid var(--accent)' : '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px',
    opacity: isDragging ? 0.5 : link.is_active ? 1 : 0.5,
    zIndex: isDragging ? 99 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {editingId === link.id ? (
        <form onSubmit={(e) => onUpdate(link.id, e)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {link.type === 'html' ? (
              <>
                <input name="title" type="text" defaultValue={link.title || ''} placeholder="Label / Judul" style={inputStyle} />
                <textarea
                  name="html_content"
                  defaultValue={link.url || ''}
                  rows={5}
                  required
                  placeholder="Kode HTML"
                  style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', resize: 'vertical' }}
                />
              </>
            ) : (
              <>
                {(link.type === 'link' || link.type === 'email' || link.type === 'telephone') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>JUDUL</label>
                    <input name="title" type="text" defaultValue={link.title || ''} required style={inputStyle} />
                  </div>
                )}
                {link.type !== 'heading' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>URL / NILAI</label>
                    <input name="url" type="text" defaultValue={link.url || ''} required style={inputStyle} />
                  </div>
                )}
                {link.type === 'heading' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>TEKS HEADING</label>
                    <input name="title" type="text" defaultValue={link.title || ''} required style={inputStyle} />
                  </div>
                )}

                {/* Subtitle */}
                {(link.type === 'link' || link.type === 'email' || link.type === 'telephone') && (
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>SUBTITLE / KETERANGAN</label>
                    <input name="subtitle" type="text" defaultValue={String(meta.subtitle || '')} placeholder="Deskripsi singkat di bawah judul (opsional)" style={inputStyle} />
                  </div>
                )}

                {/* Toggle Advanced Controls (Schedule & Gating) */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                  >
                    {showAdvanced ? '▼ Sembunyikan Opsi Lanjutan' : '▶ Jadwal & Kunci Link (Opsional)'}
                  </button>

                  {showAdvanced && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>🕒 Jadwal Mulai Tayang</label>
                        <input name="schedule_start" type="datetime-local" defaultValue={String(meta.schedule_start || '')} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>⌛ Jadwal Selesai Tayang</label>
                        <input name="schedule_end" type="datetime-local" defaultValue={String(meta.schedule_end || '')} style={inputStyle} />
                      </div>

                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                          <input type="checkbox" name="is_locked" checked={isLocked} onChange={e => setIsLocked(e.target.checked)} />
                          <span>🔒 Kunci Link Ini (Gated Link)</span>
                        </label>

                        {isLocked && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                            <select name="lock_type" value={lockType} onChange={e => setLockType(e.target.value)} style={inputStyle}>
                              <option value="pin">🔑 Kunci dengan PIN / Sandi</option>
                              <option value="age">🔞 Verifikasi Usia 18+</option>
                              <option value="sensitive">⚠️ Peringatan Konten Sensitif</option>
                            </select>

                            {lockType === 'pin' && (
                              <input name="lock_pin" type="text" defaultValue={String(meta.lock_pin || '')} placeholder="Masukkan PIN / Sandi Rahasia" style={inputStyle} />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <button type="submit" disabled={isPending} style={{ padding: '7px 16px', background: 'var(--accent)', color: '#000', borderRadius: '6px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                Simpan
              </button>
              <button type="button" onClick={onCancelEdit} style={{ padding: '7px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>
                Batal
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="link-card-item">
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Drag Handle */}
            <span
              {...attributes}
              {...listeners}
              style={{
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
                color: 'var(--text-dim)',
                padding: '2px 4px',
                fontSize: '16px',
                lineHeight: 1,
              }}
              title="Tarik untuk mengubah urutan"
            >
              ⠿
            </span>
            <span style={{ fontSize: '16px', flexShrink: 0 }}>{getLinkIcon(link)}</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {link.is_pinned && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PIN</span>}
                {Boolean(meta.is_locked) && <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>🔒 TERKUNCI</span>}
                {Boolean(meta.schedule_start || meta.schedule_end) && <span style={{ fontSize: '10px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>🕒 TERJADWAL</span>}
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
                  {link.title || link.type}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '2px 0 0' }}>
                {getLinkPreview(link)}
              </p>
              {link.type === 'link' && <p style={{ fontSize: '10px', color: 'var(--text-dim)', margin: '2px 0 0' }}>{link.click_count} klik</p>}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {link.type === 'link' && (
              <button
                type="button"
                onClick={() => onTogglePin(link.id, link.is_pinned)}
                title="Pin"
                style={{
                  padding: '5px 7px',
                  background: link.is_pinned ? 'rgba(74,222,128,0.15)' : 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: link.is_pinned ? 'var(--accent)' : 'var(--text-dim)',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >📌</button>
            )}
            <button
              type="button"
              onClick={() => onToggleActive(link.id, link.is_active)}
              style={{
                padding: '5px 8px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: link.is_active ? 'var(--success)' : 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {link.is_active ? 'Aktif' : 'Off'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(link.id)}
              style={{
                padding: '5px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(link.id)}
              style={{
                padding: '5px 10px',
                background: 'rgba(255,77,77,0.1)',
                border: '1px solid rgba(255,77,77,0.2)',
                borderRadius: '6px',
                color: 'var(--danger)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              Hapus
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LinksClient({ initialLinks, username }: Props) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isAddLocked, setIsAddLocked] = useState(false);
  const [addLockType, setAddLockType] = useState('pin');
  const [showAddAdvanced, setShowAddAdvanced] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const refreshPreview = () => {
    if (iframeRef.current) {
      iframeRef.current.src = `/@${username}?preview=true&t=${Date.now()}`;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(l => l.id === active.id);
    const newIndex = links.findIndex(l => l.id === over.id);
    const newLinks = arrayMove(links, oldIndex, newIndex);

    setLinks(newLinks);

    const linkOrders = newLinks.map((link, index) => ({
      id: link.id,
      sort_order: index,
    }));

    startTransition(async () => {
      await reorderLinks(linkOrders);
      refreshPreview();
    });
  };

  const refreshLinks = () => {
    window.location.reload();
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    startTransition(async () => {
      const fd = new FormData(form);
      if (selectedType) fd.set('type', selectedType);
      const result = await createLink(fd);
      if (result?.error) setError(result.error);
      else {
        setSelectedType(null);
        setShowBlockModal(false);
        setError(null);
        refreshLinks();
      }
    });
  };

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateLink(id, new FormData(e.currentTarget));
      if (result?.error) setError(result.error);
      else {
        setEditingId(null);
        setError(null);
        refreshLinks();
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus blok ini?')) return;
    startTransition(async () => {
      await deleteLink(id);
      setLinks(prev => prev.filter(l => l.id !== id));
      refreshPreview();
    });
  };

  const handleToggleActive = (id: string, cur: boolean) => {
    startTransition(async () => {
      await toggleLinkActive(id, cur);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_active: !cur } : l));
      refreshPreview();
    });
  };

  const handleTogglePin = (id: string, cur: boolean) => {
    startTransition(async () => {
      await toggleLinkPinned(id, cur);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_pinned: !cur } : l));
      refreshPreview();
    });
  };

  const inputStyle = {
    width: '100%', padding: '9px 13px', background: 'var(--bg)',
    border: '1px solid var(--border)', borderRadius: '7px',
    color: 'var(--text)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const,
  };

  const getLinkIcon = (link: Link) => {
    const meta = link.custom_css as Record<string, unknown> | null;
    if (meta?.embed_type === 'spotify') return '🎵';
    if (meta?.embed_type === 'youtube') return '▶️';
    if (meta?.embed_type === 'apple_music') return '🍎';
    if (link.type === 'heading') return '📝';
    if (link.type === 'text') return '📄';
    if (link.type === 'spacer') return '↕️';
    if (link.type === 'email') return '📧';
    if (link.type === 'telephone') return '📞';
    if (link.type === 'html') return '💻';
    return '🔗';
  };

  const getLinkPreview = (link: Link) => {
    const meta = link.custom_css as Record<string, unknown> | null;
    if (meta?.subtitle) return `${link.url || ''} • "${meta.subtitle}"`;
    if (link.type === 'heading') return `Heading: "${link.title || ''}"`;
    if (link.type === 'text') return 'Blok catatan teks';
    if (link.type === 'spacer') return 'Spacer pembatas';
    if (link.type === 'email') return `mailto:${link.url || ''}`;
    if (link.type === 'telephone') return `tel:${link.url || ''}`;
    if (link.type === 'html') return link.title || 'Blok HTML Kustom';
    return link.url || '';
  };

  const renderAddForm = () => {
    if (selectedType === 'html') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>LABEL / JUDUL (OPSIONAL)</label>
          <input name="title" type="text" placeholder="Contoh: Pemutar Musik / Widget" style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>KODE HTML / EMBED</label>
          <textarea
            name="html_content"
            placeholder={'<div style="background: #222; padding: 12px; border-radius: 8px;">\n  Halo dunia!\n</div>'}
            rows={5}
            required
            style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', resize: 'vertical' }}
          />
        </div>
      </>
    );

    if (selectedType === 'heading') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TEKS HEADING PEMBATAS</label>
        <input name="title" type="text" placeholder="Contoh: Karya & Portfolio" required style={inputStyle} />
      </div>
    );

    if (selectedType === 'text') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TEKS CATATAN</label>
        <textarea name="url" placeholder="Tulis catatan atau pengumuman..." required rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
    );

    if (selectedType === 'spacer') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TINGGI JARAK (px)</label>
        <input name="url" type="number" defaultValue="24" min="4" max="160" style={inputStyle} />
        <input name="title" type="hidden" value="Spacer" />
      </div>
    );

    if (selectedType === 'spotify') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL PLAYER</label>
          <input name="title" type="text" placeholder="Contoh: Lagu Favorit Saya" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL SPOTIFY (TRACK / ALBUM / PLAYLIST)</label>
          <input name="url" type="url" placeholder="https://open.spotify.com/track/..." required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'youtube') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL VIDEO</label>
          <input name="title" type="text" placeholder="Contoh: Video Klip Terbaru" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL YOUTUBE (VIDEO / SHORTS / YOcloud)</label>
          <input name="url" type="url" placeholder="https://youtube.com/watch?v=... atau https://youtu.be/..." required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'apple_music') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL PLAYER</label>
          <input name="title" type="text" placeholder="Contoh: Apple Music Playlist" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL APPLE MUSIC</label>
          <input name="url" type="url" placeholder="https://music.apple.com/..." required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'email') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL TOMBOL</label>
          <input name="title" type="text" placeholder="Contoh: Email Saya" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>ALAMAT EMAIL</label>
          <input name="url" type="email" placeholder="kamu@email.com" required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'telephone') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL TOMBOL</label>
          <input name="title" type="text" placeholder="Contoh: Hubungi Saya" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>NOMOR TELEPON</label>
          <input name="url" type="tel" placeholder="+62..." required style={inputStyle} />
        </div>
      </>
    );

    // Default 'link'
    return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL LINK</label>
          <input name="title" type="text" placeholder="Contoh: Instagram / Website Resmi" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL TUJUAN</label>
          <input name="url" type="url" placeholder="https://..." required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>SUBTITLE (OPSIONAL)</label>
          <input name="subtitle" type="text" placeholder="Contoh: Dapatkan diskon 20%" style={inputStyle} />
        </div>

        {/* Advanced Scheduling and Gating */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setShowAddAdvanced(!showAddAdvanced)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 500 }}
          >
            {showAddAdvanced ? '▼ Sembunyikan Opsi Lanjutan' : '▶ Jadwal & Kunci Link (Opsional)'}
          </button>

          {showAddAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>🕒 Jadwal Mulai Tayang</label>
                <input name="schedule_start" type="datetime-local" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>⌛ Jadwal Selesai Tayang</label>
                <input name="schedule_end" type="datetime-local" style={inputStyle} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_locked" checked={isAddLocked} onChange={e => setIsAddLocked(e.target.checked)} />
                  <span>🔒 Kunci Link Ini (Gated Link)</span>
                </label>

                {isAddLocked && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <select name="lock_type" value={addLockType} onChange={e => setAddLockType(e.target.value)} style={inputStyle}>
                      <option value="pin">🔑 Kunci dengan PIN / Sandi</option>
                      <option value="age">🔞 Verifikasi Usia 18+</option>
                      <option value="sensitive">⚠️ Peringatan Konten Sensitif</option>
                    </select>

                    {addLockType === 'pin' && (
                      <input name="lock_pin" type="text" placeholder="Masukkan PIN / Sandi Rahasia" style={inputStyle} />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <div className="responsive-grid-split">
      <div>
        {error && (
          <div style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', fontSize: '14px', color: 'var(--danger)' }}>
            {error}
          </div>
        )}

        {/* Block Type Modal */}
        {showBlockModal && !selectedType && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '520px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Pilih Tipe Blok / Embed</h3>
                <button type="button" onClick={() => setShowBlockModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '60vh', overflowY: 'auto' }}>
                {BLOCK_TYPES.map(bt => (
                  <button
                    key={bt.type}
                    type="button"
                    onClick={() => setSelectedType(bt.type)}
                    style={{ padding: '14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                  >
                    <div style={{ fontSize: '22px', marginBottom: '6px' }}>{bt.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{bt.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{bt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add Form */}
        {selectedType ? (
          <form onSubmit={handleCreate} style={{ marginBottom: '20px', background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px' }}>{BLOCK_TYPES.find(b => b.type === selectedType)?.icon}</span>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Tambah {BLOCK_TYPES.find(b => b.type === selectedType)?.label}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {renderAddForm()}
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="submit" disabled={isPending} style={{ padding: '9px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: isPending ? 'not-allowed' : 'pointer' }}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button type="button" onClick={() => { setSelectedType(null); setShowBlockModal(false); }} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}>
                Batal
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setShowBlockModal(true)} style={{ marginBottom: '20px', padding: '10px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            + Tambah Link / Embed
          </button>
        )}

        {/* Empty State */}
        {links.length === 0 && !selectedType && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Belum ada blok</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>Tambah link atau media embed pertama kamu</p>
          </div>
        )}

        {/* Sortable Links List */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {links.map((link) => (
                <SortableItem
                  key={link.id}
                  link={link}
                  editingId={editingId}
                  isPending={isPending}
                  inputStyle={inputStyle}
                  getLinkIcon={getLinkIcon}
                  getLinkPreview={getLinkPreview}
                  onEdit={(id) => setEditingId(id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Phone Mockup Preview */}
      <div style={{ position: 'sticky', top: '24px' }}>
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '600px',
          margin: '0 auto',
          background: '#000',
          borderRadius: '36px',
          border: '4px solid var(--border-hover)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '10px',
          boxSizing: 'border-box',
          position: 'relative',
        }}>
          {/* Dynamic Island / Notch */}
          <div style={{
            width: '80px',
            height: '18px',
            background: '#000',
            borderRadius: '20px',
            margin: '0 auto 6px',
            zIndex: 10,
          }} />
          {/* Screen Content */}
          <div style={{
            flex: 1,
            borderRadius: '26px',
            overflow: 'hidden',
            background: 'var(--bg)',
          }}>
            <iframe
              ref={iframeRef}
              src={`/@${username}?preview=true`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Live preview"
              onLoad={(e) => {
                try {
                  const iframe = e.currentTarget as HTMLIFrameElement;
                  if (iframe.contentDocument) {
                    iframe.contentDocument.querySelectorAll('a, button').forEach(el => {
                      el.addEventListener('click', (ev) => ev.preventDefault());
                    });
                  }
                } catch {}
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
