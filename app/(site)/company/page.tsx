import { Company } from '@/src/site-pages/Company';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('company');

export default function Page() {
  return <Company />;
}
