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
  archiveLink,
  bulkUpdateLinks,
  updateSmartSorting,
} from '@/app/actions';
import ConfirmDialog from '@/components/confirm-dialog';
import Toast from '@/components/toast';

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

const BLOCK_TYPES: { type: LinkType | 'spotify' | 'youtube' | 'apple_music' | 'soundcloud' | 'vimeo' | 'twitch' | 'lead_form' | 'calendly' | 'cal_com'; icon: string; label: string; desc: string }[] = [
  { type: 'link', icon: '🔗', label: 'Link Standar', desc: 'Tombol tautan website / portfolio' },
  { type: 'heading', icon: '📝', label: 'Heading / Kategori Pembatas', desc: 'Judul sub-bab pemisah seksi link' },
  { type: 'lead_form', icon: '📩', label: 'Form Pengumpul Email (Leads)', desc: 'Kotak pendaftaran newsletter pengunjung' },
  { type: 'calendly', icon: '📅', label: 'Calendly Booking', desc: 'Widget jadwal temu konsultasi Calendly' },
  { type: 'cal_com', icon: '📆', label: 'Cal.com Booking', desc: 'Widget booking appointment Cal.com' },
  { type: 'spotify', icon: '🎵', label: 'Spotify Embed', desc: 'Player lagu, album, atau playlist Spotify' },
  { type: 'youtube', icon: '▶️', label: 'YouTube Video', desc: 'Embed player YouTube atau Shorts' },
  { type: 'apple_music', icon: '🍎', label: 'Apple Music', desc: 'Player lagu & album Apple Music' },
  { type: 'soundcloud', icon: '☁️', label: 'SoundCloud Track', desc: 'Player musik/podcast SoundCloud' },
  { type: 'vimeo', icon: '🎬', label: 'Vimeo Video', desc: 'Player video Vimeo HD' },
  { type: 'twitch', icon: '🟣', label: 'Twitch Livestream', desc: 'Embed siaran langsung Twitch' },
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
  smartSortingEnabled?: boolean;
}

interface SortableItemProps {
  link: Link;
  editingId: string | null;
  isPending: boolean;
  isSelected: boolean;
  inputStyle: React.CSSProperties;
  getLinkIcon: (link: Link) => string;
  getLinkPreview: (link: Link) => string;
  onSelectToggle: (id: string) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpdate: (id: string, e: React.FormEvent<HTMLFormElement>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, cur: boolean) => void;
  onTogglePin: (id: string, cur: boolean) => void;
  onToggleArchive: (id: string, cur: boolean) => void;
}

function SortableItem({
  link,
  editingId,
  isPending,
  isSelected,
  inputStyle,
  getLinkIcon,
  getLinkPreview,
  onSelectToggle,
  onEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  onToggleActive,
  onTogglePin,
  onToggleArchive,
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
  const [showUtmBuilder, setShowUtmBuilder] = useState(false);
  const [utmUrl, setUtmUrl] = useState(link.url || '');
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const isArchived = Boolean(meta.is_archived);

  const applyUtm = () => {
    try {
      const urlObj = new URL(utmUrl.startsWith('http') ? utmUrl : `https://${utmUrl}`);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource);
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign);
      setUtmUrl(urlObj.toString());
      setShowUtmBuilder(false);
    } catch {}
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    background: 'var(--surface)',
    border: isDragging ? '1px solid var(--accent)' : isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
    borderRadius: '10px',
    padding: '14px',
    opacity: isArchived ? 0.6 : link.is_active ? 1 : 0.5,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {editingId === link.id ? (
        <form onSubmit={(e) => onUpdate(link.id, e)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
                Edit {link.type}
              </span>
            </div>

            {link.type === 'heading' ? (
              <input name="title" type="text" defaultValue={link.title || ''} placeholder="Judul Kategori / Heading" required style={inputStyle} />
            ) : link.type === 'spacer' ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>TINGGI JARAK (px)</label>
                <input name="url" type="number" defaultValue={link.url || '24'} min="4" max="160" required style={inputStyle} />
                <input name="title" type="hidden" value="Spacer" />
              </div>
            ) : link.type === 'text' && meta?.is_html ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>KODE HTML / EMBED WIDGET</label>
                <textarea name="html_content" defaultValue={link.url || ''} rows={4} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }} />
                <input name="title" type="text" defaultValue={link.title || 'Custom HTML'} style={{ ...inputStyle, marginTop: '6px' }} placeholder="Label internal" />
              </div>
            ) : link.type === 'text' ? (
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>TEKS PENGUMUMAN</label>
                <textarea name="title" defaultValue={link.title || ''} rows={3} style={inputStyle} />
              </div>
            ) : (
              <>
                <input name="title" type="text" defaultValue={link.title || ''} placeholder="Judul Link" required style={inputStyle} />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    name="url"
                    type="text"
                    value={utmUrl}
                    onChange={e => setUtmUrl(e.target.value)}
                    placeholder="https://"
                    required
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowUtmBuilder(!showUtmBuilder)}
                    title="UTM Builder"
                    style={{ padding: '0 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🏷️ UTM
                  </button>
                </div>

                {showUtmBuilder && (
                  <div style={{ padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text)' }}>Built-in UTM Tag Builder</span>
                    <input type="text" placeholder="utm_source (cth: instagram)" value={utmSource} onChange={e => setUtmSource(e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="utm_medium (cth: bio)" value={utmMedium} onChange={e => setUtmMedium(e.target.value)} style={inputStyle} />
                    <input type="text" placeholder="utm_campaign (cth: promo_merdeka)" value={utmCampaign} onChange={e => setUtmCampaign(e.target.value)} style={inputStyle} />
                    <button type="button" onClick={applyUtm} style={{ padding: '6px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                      Terapkan Parameter UTM
                    </button>
                  </div>
                )}

                <input name="subtitle" type="text" defaultValue={String(meta?.subtitle || '')} placeholder="Subtitle / Deskripsi Tambahan (Opsional)" style={inputStyle} />

                {/* Advanced Controls */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                  >
                    {showAdvanced ? '▼ Sembunyikan Opsi Lanjutan' : '▶ Jadwal, Gating & Spotlight (Opsional)'}
                  </button>

                  {showAdvanced && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                          <input type="checkbox" name="is_featured" defaultChecked={Boolean(meta.is_featured)} />
                          <span>⭐ Jadikan Spotlight / Featured (Menonjol & Glowing)</span>
                        </label>
                      </div>

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
                              <option value="subscribe">📩 Kunci Email (Subscribe to Unlock)</option>
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
        <div className="link-card-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelectToggle(link.id)}
              style={{ cursor: 'pointer', accentColor: 'var(--accent)' }}
            />
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
                {Boolean(meta.is_featured) && <span style={{ fontSize: '10px', background: 'rgba(125,249,182,0.2)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>⭐ SPOTLIGHT</span>}
                {isArchived && <span style={{ fontSize: '10px', background: 'rgba(148,163,184,0.2)', color: '#94a3b8', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>📦 DIARSIPKAN</span>}
                {Boolean(meta.is_locked) && (
                  <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                    {meta.lock_type === 'subscribe' ? '📩 GATED (EMAIL)' : '🔒 TERKUNCI'}
                  </span>
                )}
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
              >
                📌
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleActive(link.id, link.is_active)}
              style={{
                padding: '5px 9px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: link.is_active ? '#4ade80' : 'var(--text-dim)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {link.is_active ? 'Aktif' : 'Off'}
            </button>
            <button
              type="button"
              onClick={() => onToggleArchive(link.id, isArchived)}
              title={isArchived ? 'Pulihkan dari Arsip' : 'Arsipkan Link'}
              style={{
                padding: '5px 9px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: isArchived ? 'var(--accent)' : 'var(--text-dim)',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              {isArchived ? '📂 Pulihkan' : '📦 Arsip'}
            </button>
            <button
              type="button"
              onClick={() => onEdit(link.id)}
              style={{
                padding: '5px 9px',
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
                padding: '5px 9px',
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

export default function LinksClient({ initialLinks, username, smartSortingEnabled = false }: Props) {
  const [links, setLinks] = useState<Link[]>(initialLinks);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('all');
  const [smartSort, setSmartSort] = useState(smartSortingEnabled);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' | 'danger' } | null>(null);

  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Add Form State
  const [isAddLocked, setIsAddLocked] = useState(false);
  const [addLockType, setAddLockType] = useState('pin');
  const [showAddAdvanced, setShowAddAdvanced] = useState(false);
  const [addTitle, setAddTitle] = useState('');
  const [addUrl, setAddUrl] = useState('');
  const [addSubtitle, setAddSubtitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);

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
      setToast({ message: 'Urutan link diperbarui!', type: 'success' });
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
      if (result?.error) {
        setError(result.error);
        setToast({ message: result.error, type: 'error' });
      } else {
        setSelectedType(null);
        setShowBlockModal(false);
        setError(null);
        setAddTitle('');
        setAddUrl('');
        setAddSubtitle('');
        setToast({ message: 'Tautan baru berhasil ditambahkan!', type: 'success' });
        refreshLinks();
      }
    });
  };

  const handleUpdate = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateLink(id, new FormData(e.currentTarget));
      if (result?.error) {
        setError(result.error);
        setToast({ message: result.error, type: 'error' });
      } else {
        setEditingId(null);
        setError(null);
        setToast({ message: 'Tautan berhasil diperbarui!', type: 'success' });
        refreshLinks();
      }
    });
  };

  const handleDelete = (id: string) => {
    setDeletingLinkId(id);
  };

  const handleConfirmSingleDelete = () => {
    if (!deletingLinkId) return;
    const idToDelete = deletingLinkId;
    setDeletingLinkId(null);
    startTransition(async () => {
      await deleteLink(idToDelete);
      setLinks(prev => prev.filter(l => l.id !== idToDelete));
      setToast({ message: 'Tautan berhasil dihapus!', type: 'success' });
      refreshPreview();
    });
  };

  const handleToggleActive = (id: string, cur: boolean) => {
    startTransition(async () => {
      await toggleLinkActive(id, cur);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_active: !cur } : l));
      setToast({ message: cur ? 'Tautan dinonaktifkan' : 'Tautan diaktifkan', type: 'info' });
      refreshPreview();
    });
  };

  const handleTogglePin = (id: string, cur: boolean) => {
    startTransition(async () => {
      await toggleLinkPinned(id, cur);
      setLinks(prev => prev.map(l => l.id === id ? { ...l, is_pinned: !cur } : l));
      setToast({ message: cur ? 'Tautan dilepas dari pin' : 'Tautan dipin ke atas', type: 'info' });
      refreshPreview();
    });
  };

  const handleToggleArchive = (id: string, isArchived: boolean) => {
    startTransition(async () => {
      await archiveLink(id, !isArchived);
      setLinks(prev => prev.map(l => {
        if (l.id === id) {
          const meta = (l.custom_css as Record<string, unknown> | null) || {};
          return { ...l, custom_css: { ...meta, is_archived: !isArchived } };
        }
        return l;
      }));
      setToast({ message: isArchived ? 'Tautan dipulihkan dari arsip' : 'Tautan berhasil diarsipkan', type: 'info' });
      refreshPreview();
    });
  };

  const handleToggleSmartSort = () => {
    const nextVal = !smartSort;
    setSmartSort(nextVal);
    startTransition(async () => {
      await updateSmartSorting(nextVal);
      setToast({ message: nextVal ? 'Smart Auto-Sort diaktifkan' : 'Smart Auto-Sort dinonaktifkan', type: 'info' });
      refreshPreview();
    });
  };

  const handleBulkAction = (action: 'activate' | 'deactivate' | 'archive' | 'unarchive' | 'delete') => {
    if (selectedIds.length === 0) return;
    if (action === 'delete') {
      setShowBulkDeleteConfirm(true);
      return;
    }

    startTransition(async () => {
      const res = await bulkUpdateLinks(selectedIds, action);
      if (res?.error) {
        setError(res.error);
        setToast({ message: res.error, type: 'error' });
      } else {
        setSelectedIds([]);
        setToast({ message: `Aksi massal berhasil diterapkan (${selectedIds.length} item)`, type: 'success' });
        refreshLinks();
      }
    });
  };

  const handleConfirmBulkDelete = () => {
    const count = selectedIds.length;
    setShowBulkDeleteConfirm(false);
    startTransition(async () => {
      const res = await bulkUpdateLinks(selectedIds, 'delete');
      if (res?.error) {
        setError(res.error);
        setToast({ message: res.error, type: 'error' });
      } else {
        setSelectedIds([]);
        setToast({ message: `${count} tautan berhasil dihapus!`, type: 'success' });
        refreshLinks();
      }
    });
  };

  const handleGenerateAiCopy = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'link-copy', input: aiPrompt }),
      });
      const data = await res.json();
      if (data?.copy) {
        setAddTitle(data.copy.title || '');
        setAddSubtitle(data.copy.subtitle || '');
        setShowAiModal(false);
      }
    } catch {
      setError('Gagal membuat copy AI');
    } finally {
      setIsAiLoading(false);
    }
  };

  const getLinkIcon = (l: Link) => {
    const meta = (l.custom_css as Record<string, unknown> | null) || {};
    if (meta.is_html) return '💻';
    if (meta.embed_type === 'spotify') return '🎵';
    if (meta.embed_type === 'youtube') return '▶️';
    if (meta.embed_type === 'apple_music') return '🍎';
    if (meta.embed_type === 'soundcloud') return '☁️';
    if (meta.embed_type === 'vimeo') return '🎬';
    if (meta.embed_type === 'twitch') return '🟣';
    if (meta.embed_type === 'calendly') return '📅';
    if (meta.embed_type === 'cal_com') return '📆';
    if (l.type === 'heading') return '📝';
    if (l.type === 'lead_form' || meta.is_lead_form) return '📩';
    if (l.type === 'spacer') return '↕️';
    if (l.type === 'text') return '📄';
    if (l.type === 'email') return '📧';
    if (l.type === 'telephone') return '📞';
    return '🔗';
  };

  const getLinkPreview = (l: Link) => {
    const meta = (l.custom_css as Record<string, unknown> | null) || {};
    if (meta.is_html) return '<custom HTML embed>';
    if (l.type === 'spacer') return `Tinggi Jarak: ${l.url || '24'}px`;
    if (l.type === 'heading') return `Heading Pembatas`;
    if (l.type === 'lead_form' || meta.is_lead_form) return `Form Pengumpul Email Pengunjung`;
    if (l.type === 'text') return l.title || 'Teks pengumuman';
    return l.url || '';
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    color: 'var(--text)',
    fontSize: '13px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const displayedLinks = links.filter(l => {
    const meta = (l.custom_css as Record<string, unknown> | null) || {};
    const isArchived = Boolean(meta.is_archived);
    if (activeTab === 'active') return l.is_active && !isArchived;
    if (activeTab === 'archived') return isArchived;
    return true;
  });

  const renderAddForm = () => {
    if (selectedType === 'heading') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TEKS HEADING / KATEGORI</label>
        <input name="title" type="text" placeholder="Contoh: Media Sosial & Komunitas" required style={inputStyle} />
        <input name="url" type="hidden" value="" />
      </div>
    );

    if (selectedType === 'spacer') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TINGGI JARAK (px)</label>
        <input name="url" type="number" defaultValue="24" min="4" max="160" style={inputStyle} />
        <input name="title" type="hidden" value="Spacer" />
      </div>
    );

    if (selectedType === 'calendly') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL BOOKING</label>
          <input name="title" type="text" placeholder="Contoh: Jadwalkan Konsultasi 1-on-1" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL CALENDLY</label>
          <input name="url" type="url" placeholder="https://calendly.com/username/meeting" required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'cal_com') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL BOOKING</label>
          <input name="title" type="text" placeholder="Contoh: Booking Appointment Cal.com" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL CAL.COM</label>
          <input name="url" type="url" placeholder="https://cal.com/username" required style={inputStyle} />
        </div>
      </>
    );

    if (selectedType === 'lead_form') return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL FORM NEWSLETTER</label>
          <input name="title" type="text" placeholder="Contoh: Gabung Newsletter Mingguan" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>SUBTITLE / AJAKAN (OPSIONAL)</label>
          <input name="subtitle" type="text" placeholder="Dapatkan tips eksklusif langsung ke email kamu" style={inputStyle} />
        </div>
      </>
    );

    return (
      <>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)' }}>JUDUL LINK</label>
            <button
              type="button"
              onClick={() => setShowAiModal(true)}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              ✨ Buat Judul AI
            </button>
          </div>
          <input
            name="title"
            type="text"
            value={addTitle}
            onChange={e => setAddTitle(e.target.value)}
            placeholder="Contoh: Website Resmi / Instagram"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL TUJUAN</label>
          <input
            name="url"
            type="url"
            value={addUrl}
            onChange={e => setAddUrl(e.target.value)}
            placeholder="https://"
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>SUBTITLE / DESKRIPSI (OPSIONAL)</label>
          <input
            name="subtitle"
            type="text"
            value={addSubtitle}
            onChange={e => setAddSubtitle(e.target.value)}
            placeholder="Contoh: Dapatkan diskon 20%"
            style={inputStyle}
          />
        </div>

        {/* Advanced Scheduling and Gating */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
          <button
            type="button"
            onClick={() => setShowAddAdvanced(!showAddAdvanced)}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 500 }}
          >
            {showAddAdvanced ? '▼ Sembunyikan Opsi Lanjutan' : '▶ Jadwal, Gating & Spotlight (Opsional)'}
          </button>

          {showAddAdvanced && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
                  <input type="checkbox" name="is_featured" />
                  <span>⭐ Jadikan Spotlight / Featured (Menonjol & Glowing)</span>
                </label>
              </div>

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
                      <option value="subscribe">📩 Kunci Email (Subscribe to Unlock)</option>
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

        {/* Smart Sorting Banner */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '14px' }}>⚡</span>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Smart Sorting (Auto-Rank)</span>
              {smartSort && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>AKTIF</span>}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '2px 0 0' }}>
              Otomatis menaikkan tautan yang paling sering diklik ke posisi teratas.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleSmartSort}
            style={{
              padding: '6px 12px',
              background: smartSort ? 'var(--accent)' : 'var(--bg)',
              color: smartSort ? '#000' : 'var(--text-muted)',
              border: `1px solid ${smartSort ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {smartSort ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '6px 14px',
              background: activeTab === 'all' ? 'var(--accent)' : 'var(--surface)',
              color: activeTab === 'all' ? '#000' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'all' ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Semua ({links.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            style={{
              padding: '6px 14px',
              background: activeTab === 'active' ? 'var(--accent)' : 'var(--surface)',
              color: activeTab === 'active' ? '#000' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'active' ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Aktif ({links.filter(l => l.is_active && !(l.custom_css as Record<string, unknown> | null)?.is_archived).length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archived')}
            style={{
              padding: '6px 14px',
              background: activeTab === 'archived' ? 'var(--accent)' : 'var(--surface)',
              color: activeTab === 'archived' ? '#000' : 'var(--text-muted)',
              border: `1px solid ${activeTab === 'archived' ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Diarsipkan ({links.filter(l => Boolean((l.custom_css as Record<string, unknown> | null)?.is_archived)).length})
          </button>
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && (
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
              {selectedIds.length} link terpilih
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => handleBulkAction('activate')} style={{ padding: '5px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: '#4ade80', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                ✓ Aktifkan
              </button>
              <button onClick={() => handleBulkAction('deactivate')} style={{ padding: '5px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}>
                Off-kan
              </button>
              <button onClick={() => handleBulkAction('archive')} style={{ padding: '5px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', color: '#94a3b8', fontSize: '12px', cursor: 'pointer' }}>
                📦 Arsipkan
              </button>
              <button onClick={() => handleBulkAction('delete')} style={{ padding: '5px 10px', background: 'rgba(255,77,77,0.15)', border: '1px solid rgba(255,77,77,0.3)', borderRadius: '6px', color: 'var(--danger)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
                🗑️ Hapus
              </button>
              <button onClick={() => setSelectedIds([])} style={{ padding: '5px 8px', background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}>
                Batal
              </button>
            </div>
          </div>
        )}

        {/* AI Copywriter Modal */}
        {showAiModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '440px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}>
                ✨ AI Copywriter
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '14px' }}>
                Jelaskan tautan/produk kamu, AI akan membuat judul & subtitle yang menarik pengunjung.
              </p>
              <textarea
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Contoh: E-book panduan belajar trading crypto pemula diskon 50%"
                rows={3}
                style={{ ...inputStyle, marginBottom: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  onClick={handleGenerateAiCopy}
                  style={{ flex: 1, padding: '9px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: isAiLoading ? 'not-allowed' : 'pointer' }}
                >
                  {isAiLoading ? 'Memproses AI...' : 'Buat Copy Sekarang'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  style={{ padding: '9px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-dim)', fontSize: '13px', cursor: 'pointer' }}
                >
                  Tutup
                </button>
              </div>
            </div>
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
            + Tambah Blok / Embed
          </button>
        )}

        {/* Links List */}
        {displayedLinks.length === 0 && !selectedType && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>
              {activeTab === 'archived' ? 'Tidak ada link yang diarsipkan' : 'Belum ada link'}
            </p>
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedLinks.map(l => l.id)} strategy={verticalListSortingStrategy}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {displayedLinks.map(link => (
                <SortableItem
                  key={link.id}
                  link={link}
                  editingId={editingId}
                  isPending={isPending}
                  isSelected={selectedIds.includes(link.id)}
                  inputStyle={inputStyle}
                  getLinkIcon={getLinkIcon}
                  getLinkPreview={getLinkPreview}
                  onSelectToggle={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
                  onEdit={id => setEditingId(id)}
                  onCancelEdit={() => setEditingId(null)}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  onTogglePin={handleTogglePin}
                  onToggleArchive={handleToggleArchive}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Live Phone Preview */}
      <div className="preview-container" style={{ position: 'sticky', top: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', width: '310px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px 8px', borderBottom: '1px solid var(--border)', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Live Preview</span>
            <button
              type="button"
              onClick={refreshPreview}
              style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
            >
              ↻ Refresh
            </button>
          </div>
          <iframe
            ref={iframeRef}
            src={`/@${username}?preview=true`}
            title="Profil Preview"
            style={{ width: '100%', height: '540px', border: 'none', borderRadius: '16px', background: '#000' }}
          />
        </div>
      </div>

      {/* Single Link Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingLinkId)}
        title="Hapus Link Ini?"
        message="Tautan ini akan dihapus permanen dari profil biolink kamu. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Hapus Link"
        cancelLabel="Batal"
        isDanger={true}
        isLoading={isPending}
        onConfirm={handleConfirmSingleDelete}
        onCancel={() => setDeletingLinkId(null)}
      />

      {/* Bulk Delete Confirmation */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        title={`Hapus ${selectedIds.length} Link Terpilih?`}
        message={`Sebanyak ${selectedIds.length} tautan yang dipilih akan dihapus secara bersamaan. Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus Semua Terpilih"
        cancelLabel="Batal"
        isDanger={true}
        isLoading={isPending}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setShowBulkDeleteConfirm(false)}
      />

      {/* Floating Toast Feedback */}
      <Toast
        message={toast?.message ?? null}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
