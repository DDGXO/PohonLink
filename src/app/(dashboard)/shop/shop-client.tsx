'use client';

import { useState, useTransition } from 'react';
import type { Profile, Link as ProductLink } from '@/types/database';
import { createProduct, updateProduct, deleteLink, toggleLinkActive, toggleLinkPinned, toggleShopSetting } from '@/app/actions';

interface Props {
  initialProducts: ProductLink[];
  profile: Profile | null;
}

const BADGE_PRESETS = [
  { value: '', label: 'Tanpa Badge' },
  { value: '🔥 Best Seller', label: '🔥 Best Seller' },
  { value: '💥 Diskon Spesial', label: '💥 Diskon Spesial' },
  { value: '✨ Produk Baru', label: '✨ Produk Baru' },
  { value: '⏳ Stok Terbatas', label: '⏳ Stok Terbatas' },
  { value: '📦 Pre-Order', label: '📦 Pre-Order' },
  { value: '⭐ Rekomendasi', label: '⭐ Rekomendasi' },
];

const CTA_PRESETS = [
  { label: 'Beli Sekarang 🛒', text: 'Beli Sekarang 🛒', hint: 'Universal' },
  { label: 'Beli di Shopee 🧡', text: 'Beli di Shopee 🧡', hint: 'Shopee' },
  { label: 'Beli di Tokopedia 🟢', text: 'Beli di Tokopedia 🟢', hint: 'Tokopedia' },
  { label: 'Order via WhatsApp 💬', text: 'Order via WhatsApp 💬', hint: 'WhatsApp Checkout' },
  { label: 'Beli di TikTok Shop 🎵', text: 'Beli di TikTok Shop 🎵', hint: 'TikTok' },
  { label: 'Lihat Detail ↗', text: 'Lihat Detail ↗', hint: 'Info/Katalog' },
];

export default function ShopClient({ initialProducts, profile }: Props) {
  const [products, setProducts] = useState<ProductLink[]>(initialProducts);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [shopEnabled, setShopEnabled] = useState(profile?.settings?.enable_shop ?? true);
  const [shopTitle, setShopTitle] = useState(profile?.settings?.shop_title || 'Toko');
  const [shopLayout, setShopLayout] = useState<'grid' | 'list'>(profile?.settings?.shop_layout || 'grid');

  // Form states
  const [priceInput, setPriceInput] = useState('');
  const [origPriceInput, setOrigPriceInput] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('');
  const [selectedCta, setSelectedCta] = useState('Beli Sekarang 🛒');
  const [imageUrl, setImageUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [waPhone, setWaPhone] = useState('');
  const [isWaMode, setIsWaMode] = useState(false);

  const totalClicks = products.reduce((sum, p) => sum + (p.click_count || 0), 0);

  const refreshPage = () => {
    window.location.reload();
  };

  const handleToggleShop = (enabled: boolean, layoutParam?: 'grid' | 'list') => {
    setShopEnabled(enabled);
    const targetLayout = layoutParam || shopLayout;
    if (layoutParam) setShopLayout(layoutParam);
    startTransition(async () => {
      await toggleShopSetting(enabled, shopTitle, targetLayout);
      setSuccess('Pengaturan toko diperbarui!');
      setTimeout(() => setSuccess(null), 2500);
    });
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setProductTitle('');
    setProductUrl('');
    setPriceInput('');
    setOrigPriceInput('');
    setSelectedBadge('');
    setSelectedCta('Beli Sekarang 🛒');
    setImageUrl('');
    setIsWaMode(false);
    setShowAddModal(true);
    setError(null);
  };

  const handleOpenEdit = (p: ProductLink) => {
    const meta = (p.custom_css as Record<string, unknown> | null) || {};
    setEditingProduct(p);
    setProductTitle(p.title || '');
    setProductUrl(p.url || '');
    setPriceInput(meta.price ? String(meta.price) : '');
    setOrigPriceInput(meta.original_price ? String(meta.original_price) : '');
    setSelectedBadge(meta.badge ? String(meta.badge) : '');
    setSelectedCta(meta.button_text ? String(meta.button_text) : 'Beli Sekarang 🛒');
    setImageUrl(meta.image_url ? String(meta.image_url) : '');
    setIsWaMode(p.url?.includes('wa.me') || p.url?.includes('api.whatsapp.com') || false);
    setShowAddModal(true);
    setError(null);
  };

  const handleCtaPresetClick = (ctaText: string) => {
    setSelectedCta(ctaText);
    if (ctaText.includes('WhatsApp')) {
      setIsWaMode(true);
      if (waPhone && productTitle) {
        const text = encodeURIComponent(`Halo, saya mau beli ${productTitle}`);
        setProductUrl(`https://wa.me/${waPhone.replace(/[^0-9]/g, '')}?text=${text}`);
      }
    } else {
      setIsWaMode(false);
    }
  };

  const handleWaPhoneChange = (phone: string) => {
    setWaPhone(phone);
    const clean = phone.replace(/[^0-9]/g, '');
    const title = productTitle || 'produk ini';
    const text = encodeURIComponent(`Halo, saya tertarik memesan "${title}"`);
    setProductUrl(`https://wa.me/${clean}?text=${text}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      let res;
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, formData);
      } else {
        res = await createProduct(formData);
      }

      if (res?.error) {
        setError(res.error);
      } else {
        setShowAddModal(false);
        refreshPage();
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Hapus produk ini dari toko?')) return;
    startTransition(async () => {
      await deleteLink(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    });
  };

  const handleToggleActive = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleLinkActive(id, current);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: !current } : p));
    });
  };

  const handleTogglePin = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleLinkPinned(id, current);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_pinned: !current } : p));
    });
  };

  const formatPrice = (val: string | number | undefined) => {
    if (!val) return 'Rp 0';
    const num = typeof val === 'number' ? val : parseInt(String(val).replace(/[^0-9]/g, ''), 10);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'start' }}>
      {/* Main Column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Notification Toasts */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', padding: '12px 16px', borderRadius: '8px', fontSize: '13px' }}>
            {success}
          </div>
        )}

        {/* Overview Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Total Produk</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{products.length}</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Produk Aktif</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)', margin: 0 }}>{products.filter(p => p.is_active).length}</p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 600 }}>Total Klik Beli</p>
            <p style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8', margin: 0 }}>{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        {/* Store Control Settings Bar */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>🛍️</span>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>Tampilkan Tab Toko di Profil Publik</h3>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-dim)', margin: '4px 0 0' }}>
              Bila diaktifkan, pengunjung akan melihat tombol/tab Toko di halaman <b>/@{profile?.username}</b>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Layout Switcher */}
            <div style={{ display: 'inline-flex', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => handleToggleShop(shopEnabled, 'grid')}
                title="Grid 2 Kolom"
                style={{
                  padding: '6px 10px',
                  background: shopLayout === 'grid' ? 'var(--accent)' : 'transparent',
                  color: shopLayout === 'grid' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ▦ Grid
              </button>
              <button
                type="button"
                onClick={() => handleToggleShop(shopEnabled, 'list')}
                title="List Memanjang"
                style={{
                  padding: '6px 10px',
                  background: shopLayout === 'list' ? 'var(--accent)' : 'transparent',
                  color: shopLayout === 'list' ? '#000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                ☰ List
              </button>
            </div>

            <input
              type="text"
              placeholder="Judul Tab (misal: Toko)"
              value={shopTitle}
              onChange={(e) => setShopTitle(e.target.value)}
              onBlur={() => handleToggleShop(shopEnabled)}
              style={{
                padding: '7px 10px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                fontSize: '12px',
                outline: 'none',
                width: '110px',
              }}
              title="Ubah label tab toko"
            />
            <button
              type="button"
              onClick={() => handleToggleShop(!shopEnabled)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                background: shopEnabled ? 'var(--accent)' : 'var(--bg)',
                color: shopEnabled ? '#000' : 'var(--text-dim)',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              {shopEnabled ? '✓ Toko Aktif' : 'Nonaktif'}
            </button>
            <button
              type="button"
              onClick={handleOpenAdd}
              style={{
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--accent)',
                color: '#000',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              + Tambah Produk
            </button>
          </div>
        </div>

        {/* Product Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '1px dashed var(--border)', borderRadius: '12px' }}>
              <p style={{ fontSize: '36px', margin: '0 0 12px' }}>🛍️</p>
              <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)', margin: '0 0 6px' }}>Belum ada produk di tokomu</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: '0 0 16px', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto' }}>
                Tambahkan produk fisik, barang digital, atau jasa yang ingin kamu pajang untuk pengunjung biolink kamu.
              </p>
              <button
                type="button"
                onClick={handleOpenAdd}
                style={{ padding: '9px 20px', background: 'var(--accent)', color: '#000', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                + Tambah Produk Pertama
              </button>
            </div>
          )}

          {products.map((product) => {
            const meta = (product.custom_css as Record<string, unknown> | null) || {};
            const hasOrigPrice = Boolean(meta.original_price && Number(meta.original_price) > Number(meta.price));

            return (
              <div
                key={product.id}
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  opacity: product.is_active ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0 }}>
                  {/* Thumbnail */}
                  {meta.image_url ? (
                    <img
                      src={String(meta.image_url)}
                      alt={product.title || ''}
                      style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }}
                    />
                  ) : (
                    <div style={{ width: '64px', height: '64px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>
                      📦
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                      {product.is_pinned && <span style={{ fontSize: '10px', background: 'rgba(74,222,128,0.15)', color: 'var(--accent)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>PIN</span>}
                      {meta.badge ? <span style={{ fontSize: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>{String(meta.badge)}</span> : null}
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.title}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent)' }}>
                        {formatPrice(meta.price as string | number)}
                      </span>
                      {hasOrigPrice && (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>
                          {formatPrice(meta.original_price as string | number)}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-dim)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Target: <a href={product.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>{product.url}</a> • {product.click_count || 0} klik
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePin(product.id, product.is_pinned)}
                    title={product.is_pinned ? 'Unpin' : 'Pin ke atas'}
                    style={{ padding: '6px 8px', background: product.is_pinned ? 'rgba(74,222,128,0.15)' : 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: product.is_pinned ? 'var(--accent)' : 'var(--text-dim)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    📌
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(product.id, product.is_active)}
                    style={{ padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: product.is_active ? 'var(--accent)' : 'var(--text-dim)', fontSize: '11px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(product)}
                    style={{ padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: '#f87171', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Live Mobile Preview */}
      <div style={{ position: 'sticky', top: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>Live Preview Toko</span>
            </div>
            {profile?.username && (
              <a
                href={`/@${profile.username}/shop`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '11px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
              >
                Buka Toko ↗
              </a>
            )}
          </div>

          <div style={{
            width: '100%',
            height: '560px',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '8px solid #1a1a1a',
            background: '#000',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          }}>
            <iframe
              src={`/@${profile?.username || ''}/shop?preview=true`}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Preview Toko"
            />
          </div>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Product Title */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  NAMA PRODUK *
                </label>
                <input
                  name="title"
                  type="text"
                  placeholder="Contoh: E-Book Panduan Coding Next.js"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Product Description */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  DESKRIPSI SINGKAT
                </label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Penjelasan singkat keuntungan produk ini..."
                  defaultValue={editingProduct ? (editingProduct.custom_css as Record<string, unknown> | null)?.description as string : ''}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {/* Price & Original Price */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    HARGA JUAL (RP) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    placeholder="99000"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                    HARGA CORET / ASLI (OPSIONAL)
                  </label>
                  <input
                    name="original_price"
                    type="number"
                    placeholder="199000"
                    value={origPriceInput}
                    onChange={(e) => setOrigPriceInput(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  URL FOTO PRODUK
                </label>
                <input
                  name="image_url"
                  type="url"
                  placeholder="https://example.com/product.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Badge Selection */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  BADGE PROMO
                </label>
                <select
                  name="badge"
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none' }}
                >
                  {BADGE_PRESETS.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* CTA Presets & Target URL */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  PRESET TOMBOL BELI (CTA)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', marginBottom: '8px' }}>
                  {CTA_PRESETS.map(preset => (
                    <button
                      key={preset.text}
                      type="button"
                      onClick={() => handleCtaPresetClick(preset.text)}
                      style={{
                        padding: '8px 10px',
                        background: selectedCta === preset.text ? 'var(--accent-dim)' : 'var(--bg)',
                        border: `1px solid ${selectedCta === preset.text ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: selectedCta === preset.text ? 'var(--accent)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <input
                  name="button_text"
                  type="text"
                  placeholder="Teks tombol (misal: Beli di Shopee)"
                  value={selectedCta}
                  onChange={(e) => setSelectedCta(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '12px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' }}
                />
              </div>

              {/* WhatsApp Helper if WA is active */}
              {isWaMode && (
                <div style={{ padding: '10px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '8px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#4ade80', marginBottom: '4px' }}>
                    NOMOR WHATSAPP PENJUAL (DENGAN KODE NEGARA 62...)
                  </label>
                  <input
                    type="text"
                    placeholder="628123456789"
                    value={waPhone}
                    onChange={(e) => handleWaPhoneChange(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              {/* Target Checkout URL */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  LINK TUJUAN PEMBELIAN / CHECKOUT *
                </label>
                <input
                  name="url"
                  type="url"
                  placeholder="https://shopee.co.id/product-link atau https://wa.me/..."
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  type="submit"
                  disabled={isPending}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: 'var(--accent)',
                    color: '#000',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: isPending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isPending ? 'Menyimpan...' : (editingProduct ? 'Perbarui Produk' : 'Simpan Produk')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '11px 16px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text-dim)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
