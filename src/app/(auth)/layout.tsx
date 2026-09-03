import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthenticatedUser();
  if (auth?.user) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
