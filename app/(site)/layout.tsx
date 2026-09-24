import { SiteLayout } from '@/src/components/layout/SiteLayout';
import { ContentProvider } from '@/src/content/ContentProvider';
import { getContent, toPublic } from '@/src/content/store';
import { JsonLd, organizationLd, websiteLd } from '@/src/seo/jsonld';

export default async function SiteRootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  return (
    <ContentProvider content={toPublic(content)}>
      <JsonLd data={[organizationLd(content), websiteLd(content)]} />
      <SiteLayout>{children}</SiteLayout>
    </ContentProvider>
  );
}
