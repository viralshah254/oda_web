import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://oda.co.ke';
  const now = new Date();

  const staticPages = [
    { url: baseUrl, priority: 1.0 },
    { url: `${baseUrl}/categories`, priority: 0.9 },
    { url: `${baseUrl}/b2b`, priority: 0.8 },
    { url: `${baseUrl}/supplier`, priority: 0.7 },
    { url: `${baseUrl}/supplier/apply`, priority: 0.65 },
    { url: `${baseUrl}/manufacturer`, priority: 0.7 },
    { url: `${baseUrl}/rider`, priority: 0.7 },
    { url: `${baseUrl}/rider/apply`, priority: 0.65 },
    { url: `${baseUrl}/legal/privacy`, priority: 0.3 },
    { url: `${baseUrl}/legal/terms`, priority: 0.3 },
  ];

  const categoryPages = [
    'groceries-kitchen',
    'snacks-drinks',
    'beauty-personal-care',
    'household-essentials',
    'health-pharma',
    'baby-kids',
    'pet-care',
    'kenya-essentials',
    'electronics-accessories',
    'sports-outdoor',
  ].map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    priority: 0.85,
  }));

  return [...staticPages, ...categoryPages].map((page) => ({
    url: page.url,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: page.priority,
  }));
}
