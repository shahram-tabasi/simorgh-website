import type { Metadata } from 'next';
import { LoginForm } from '@/src/admin/ui/LoginForm';
import { adminConfigured } from '@/src/admin/session';

export const metadata: Metadata = { title: 'ورود' };
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  return <LoginForm configured={adminConfigured()} />;
}
