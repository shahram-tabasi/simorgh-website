import type { Metadata } from 'next';
import { SettingsEditor } from '@/src/admin/ui/sections/SettingsEditor';

export const metadata: Metadata = { title: 'تنظیمات' };

export default function Page() {
  return <SettingsEditor />;
}
