import { Insights } from '@/src/site-pages/Insights';
import { pageMetadata } from '@/src/seo/metadata';

export const generateMetadata = pageMetadata('insights');

export default function Page() {
  return <Insights />;
}
