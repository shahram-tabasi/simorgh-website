import { Home } from '@/src/site-pages/Home';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('home');

export default function Page() {
  return <Home />;
}
