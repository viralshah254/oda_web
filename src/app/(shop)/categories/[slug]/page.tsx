import type { Metadata } from 'next';
import { CategoryPageClient } from './category-page-client';
import { fetchProductsByCategory } from '@/lib/server/catalog-fetcher';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subcategory?: string; sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/-/g, ' ');
  return {
    title: `${label} | Oda`,
    description: `Shop ${label} on Oda — delivered in minutes across Kenya.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { subcategory, sort, page } = await searchParams;

  const products = await fetchProductsByCategory(slug, {
    subcategory,
    sort,
    page: page ? parseInt(page, 10) : 1,
    limit: 30,
  });

  return (
    <CategoryPageClient
      slug={slug}
      initialProducts={products}
    />
  );
}
