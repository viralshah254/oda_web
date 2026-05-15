import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/portal', '/api', '/account'],
      },
    ],
    sitemap: 'https://oda.co.ke/sitemap.xml',
  };
}
