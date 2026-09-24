import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { default: 'پنل مدیریت', template: '%s · پنل مدیریت SIMORGH' },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div dir="rtl" lang="fa" className="admin-root min-h-screen bg-space-0 text-ink" style={{ fontFamily: "'Vazirmatn', Tahoma, system-ui, sans-serif" }}>
      {children}
    </div>
  );
}
