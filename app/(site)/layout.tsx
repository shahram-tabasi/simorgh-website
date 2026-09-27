import { SiteLayout } from '@/src/components/layout/SiteLayout';
import { ContentProvider } from '@/src/content/ContentProvider';
import { getContent, toPublic } from '@/src/content/store';
import { JsonLd, organizationLd, websiteLd } from '@/src/seo/jsonld';

// Rendered per request from storage/content.json, never prerendered. A page
// prerendered at build time holds the *default* content, and in a container
// the regenerated copy lives only until the next restart: every restart would
// put the site back to its defaults until the admin saved again. getContent()
// caches by file mtime, so this costs a stat() per request.
export const dynamic = 'force-dynamic';

export default async function SiteRootLayout({ children }: { children: React.ReactNode }) {
  const content = await getContent();
  return (
    <ContentProvider content={toPublic(content)}>
      <JsonLd data={[organizationLd(content), websiteLd(content)]} />
      <SiteLayout>{children}</SiteLayout>
    </ContentProvider>
  );
}
