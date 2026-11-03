import { SAMPLE_PROPERTIES } from '@/lib/data/sample-data';
import PropertyDetailClient from '@/components/properties/PropertyDetailClient';

export function generateStaticParams() {
  return SAMPLE_PROPERTIES.map(p => ({
    slug: p.slug,
  }));
}

export default async function PropertyDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PropertyDetailClient slug={slug} />;
}
