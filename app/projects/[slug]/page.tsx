import { SAMPLE_PROJECTS } from '@/lib/data/sample-data';
import ProjectDetailClient from '@/components/projects/ProjectDetailClient';

export function generateStaticParams() {
  return SAMPLE_PROJECTS.map(p => ({
    slug: p.slug,
  }));
}

export default async function ProjectDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProjectDetailClient slug={slug} />;
}
