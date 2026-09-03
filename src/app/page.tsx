import { getAuthenticatedUser } from '@/lib/auth';
import LandingClient from './landing-client';

export const metadata = {
  title: 'Pohonlink: Platform Biolink dan Katalog Produk',
  description: 'Satu tautan terpadu untuk portofolio, media sosial, dan transaksi penjualan produk online.',
};

export default async function HomePage() {
  const auth = await getAuthenticatedUser();
  const isLoggedIn = Boolean(auth?.user);
  const username = auth?.profile?.username;

  return <LandingClient isLoggedIn={isLoggedIn} username={username} />;
}
