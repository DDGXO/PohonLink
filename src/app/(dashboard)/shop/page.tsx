import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';
import { getAllProducts } from '@/lib/db/queries';
import ShopClient from './shop-client';

export const metadata = {
  title: 'Toko | Pohonlink',
  description: 'Kelola showcase dan katalog produk jualan kamu',
};

export default async function ShopPage() {
  const auth = await getAuthenticatedUser();
  if (!auth?.user) redirect('/login');
  if (auth.profile?.is_blocked) redirect('/blocked');

  const products = await getAllProducts(auth.user.id);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text)', margin: '0 0 4px' }}>
          🛍️ Toko & Showcase Produk
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>
          Pajang produk digital, barang fisik, atau jasa kamu. Pembeli akan langsung diarahkan ke link checkout pilihanmu (Shopee, Tokopedia, WhatsApp, dll).
        </p>
      </div>

      <ShopClient initialProducts={products} profile={auth.profile} />
    </div>
  );
}
