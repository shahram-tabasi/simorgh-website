import { Technology } from '@/src/site-pages/Technology';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('technology');

export default function Page() {
  return <Technology />;
}
