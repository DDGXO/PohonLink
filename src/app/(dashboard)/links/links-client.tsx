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

const BLOCK_TYPES: { type: LinkType; icon: string; label: string; desc: string }[] = [
  { type: 'link', icon: '🔗', label: 'Link', desc: 'Tombol link ke website' },
  { type: 'html', icon: '💻', label: 'Custom HTML', desc: 'Kode HTML, widget, atau iframe' },
  { type: 'email', icon: '📧', label: 'Email', desc: 'Tombol email (mailto:)' },
  { type: 'telephone', icon: '📞', label: 'Telepon', desc: 'Tombol nomor telepon' },
  { type: 'heading', icon: '📝', label: 'Heading', desc: 'Judul / pemisah seksi' },
  { type: 'text', icon: '📄', label: 'Teks', desc: 'Paragraf teks bebas' },
  { type: 'spacer', icon: '⬛', label: 'Spacer', desc: 'Jarak kosong antar link' },
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
                  <input name="title" type="text" defaultValue={link.title || ''} required style={inputStyle} />
                )}
                {link.type !== 'heading' && (
                  <input name="url" type="text" defaultValue={link.url || ''} required style={inputStyle} />
                )}
                {link.type === 'heading' && (
                  <input name="title" type="text" defaultValue={link.title || ''} required style={inputStyle} />
                )}
              </>
            )}
            <div style={{ display: 'flex', gap: '8px' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {link.is_pinned && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PIN</span>}
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {link.title || link.type}
                </p>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {getLinkPreview(link)}
              </p>
              {link.type === 'link' && <p style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '2px' }}>{link.click_count} klik</p>}
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
                  borderRadius: '5px',
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
                padding: '5px 8px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '5px',
                color: link.is_active ? 'var(--success)' : 'var(--text-dim)',
                fontSize: '10px',
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
                borderRadius: '5px',
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
                borderRadius: '5px',
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
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedType, setSelectedType] = useState<LinkType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const refreshLinks = () => window.location.reload();
  const refreshPreview = () => {
    if (iframeRef.current) iframeRef.current.src = iframeRef.current.src;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = links.findIndex(l => l.id === active.id);
    const newIndex = links.findIndex(l => l.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newLinks = arrayMove(links, oldIndex, newIndex);
    setLinks(newLinks);

    const orders = newLinks.map((l, index) => ({ id: l.id, sort_order: index }));
    startTransition(async () => {
      await reorderLinks(orders);
      refreshPreview();
    });
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set('type', selectedType || 'link');
    startTransition(async () => {
      const result = await createLink(fd);
      if (result?.error) setError(result.error);
      else {
        setSelectedType(null);
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
    if (link.type === 'heading') return '📝';
    if (link.type === 'text') return '📄';
    if (link.type === 'spacer') return '⬛';
    if (link.type === 'email') return '📧';
    if (link.type === 'telephone') return '📞';
    if (link.type === 'html') return '💻';
    return '🔗';
  };

  const getLinkPreview = (link: Link) => {
    if (link.type === 'heading') return `Heading: "${link.title || ''}"`;
    if (link.type === 'text') return 'Blok teks';
    if (link.type === 'spacer') return 'Spacer';
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
            placeholder={'<div style="background: #222; padding: 12px; border-radius: 8px;">\n  Halo dunia!\n</div>\n<!-- atau <iframe> Spotify, YouTube, dll -->'}
            rows={5}
            required
            style={{ ...inputStyle, fontFamily: 'var(--font-mono, monospace)', fontSize: '12px', resize: 'vertical' }}
          />
        </div>
      </>
    );
    if (selectedType === 'heading') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TEKS HEADING</label>
        <input name="title" type="text" placeholder="Contoh: Media Sosial" required style={inputStyle} />
      </div>
    );
    if (selectedType === 'text') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TEKS</label>
        <textarea name="url" placeholder="Tulis teks di sini..." required rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
    );
    if (selectedType === 'spacer') return (
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>TINGGI (px)</label>
        <input name="url" type="number" defaultValue="20" min="4" max="120" style={inputStyle} />
        <input name="title" type="hidden" value="Spacer" />
      </div>
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
    return (
      <>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>JUDUL</label>
          <input name="title" type="text" placeholder="Contoh: Instagram" required style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-dim)', marginBottom: '6px' }}>URL</label>
          <input name="url" type="url" placeholder="https://" required style={inputStyle} />
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
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '14px', padding: '28px', width: '100%', maxWidth: '480px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Pilih Tipe Blok</h3>
                <button type="button" onClick={() => setShowBlockModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: '20px', cursor: 'pointer' }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {BLOCK_TYPES.map(bt => (
                  <button
                    key={bt.type}
                    type="button"
                    onClick={() => setSelectedType(bt.type)}
                    style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{bt.icon}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{bt.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{bt.desc}</div>
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
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>Tambah {BLOCK_TYPES.find(b => b.type === selectedType)?.label}</h3>
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
            + Tambah Blok
          </button>
        )}

        {/* Empty State */}
        {links.length === 0 && !selectedType && (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px' }}>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🌿</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 500 }}>Belum ada blok</p>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', marginTop: '4px' }}>Tambah blok pertama kamu</p>
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

      {/* Live Preview (Desktop Only) */}
      <div className="responsive-preview-pane" style={{ width: '320px', flexShrink: 0 }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Preview</p>
        <div style={{
          width: '100%',
          maxWidth: '320px',
          height: '600px',
          background: '#0d0d0d',
          borderRadius: '40px',
          border: '3px solid rgba(255,255,255,0.14)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 0 4px rgba(255,255,255,0.08)',
          padding: '10px 8px 12px',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Dynamic Island Notch */}
          <div style={{
            width: '80px',
            height: '16px',
            background: '#000000',
            borderRadius: '9999px',
            margin: '0 auto 8px',
            flexShrink: 0,
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
              src={`/@${username}`}
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
