import { Industries } from '@/src/site-pages/Industries';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('industries');

export default function Page() {
  return <Industries />;
}
