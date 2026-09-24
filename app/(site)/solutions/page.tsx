import { Solutions } from '@/src/site-pages/Solutions';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('solutions');

export default function Page() {
  return <Solutions />;
}
