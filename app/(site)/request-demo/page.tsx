import { RequestDemo } from '@/src/site-pages/RequestDemo';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('requestDemo');

export default function Page() {
  return <RequestDemo />;
}
