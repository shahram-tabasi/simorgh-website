import type { Metadata } from 'next';
import { ProductsEditor } from '@/src/admin/ui/sections/ProductsEditor';

export const metadata: Metadata = { title: 'محصولات' };

export default function Page() {
  return <ProductsEditor />;
}
