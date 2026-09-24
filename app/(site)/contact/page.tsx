import { Contact } from '@/src/site-pages/Contact';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('contact');

export default function Page() {
  return <Contact />;
}
