import { Products } from '@/src/site-pages/Products';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('products');

export default function Page() {
  return <Products />;
}
