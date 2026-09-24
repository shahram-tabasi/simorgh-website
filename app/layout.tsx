import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import '../src/index.css';
import { getContent } from '@/src/content/store';
import { absoluteUrl, siteUrl } from '@/src/seo/metadata';

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return {
    metadataBase: new URL(siteUrl(c)),
    title: { default: c.seo.defaultTitle, template: c.seo.titleTemplate },
    description: c.seo.description,
    keywords: c.seo.keywords,
    applicationName: c.settings.siteName,
    authors: [{ name: c.settings.legalName }],
    creator: c.settings.legalName,
    publisher: c.settings.legalName,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: c.settings.siteName,
      title: c.seo.defaultTitle,
      description: c.seo.description,
      url: siteUrl(c),
      images: c.seo.ogImage ? [{ url: absoluteUrl(c, c.seo.ogImage), width: 1200, height: 630 }] : undefined,
      locale: 'en_US',
      alternateLocale: ['fa_IR', 'ar_AE', 'tr_TR', 'de_DE', 'fr_FR', 'es_ES', 'zh_CN', 'ja_JP', 'ru_RU'],
    },
    twitter: {
      card: 'summary_large_image',
      site: c.seo.twitterHandle || undefined,
      title: c.seo.defaultTitle,
      description: c.seo.description,
      images: c.seo.ogImage ? [absoluteUrl(c, c.seo.ogImage)] : undefined,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
    verification: {
      google: c.settings.verification.google || undefined,
      yandex: c.settings.verification.yandex || undefined,
      other: c.settings.verification.bing ? { 'msvalidate.01': c.settings.verification.bing } : undefined,
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  themeColor: '#04060e',
  colorScheme: 'dark',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  const ga = c.settings.gaId.trim();
  return (
    <html lang="en" dir="ltr">
      <body>
        {children}
        {/^G-[A-Z0-9]+$/i.test(ga) && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
            <Script id="ga" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
