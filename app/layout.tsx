import '../src/index.css';

export const metadata = {
  title: 'Simorgh',
  description: 'Simorgh intelligent engineering and operations platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
