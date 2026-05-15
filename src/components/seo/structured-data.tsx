export function ProductStructuredData({ product }: {
  product: {
    name: string;
    description: string;
    image: string;
    priceKes: number;
    sku: string;
    availability: 'InStock' | 'OutOfStock';
    brand?: string;
    ratingValue?: number;
    reviewCount?: number;
  };
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: product.priceKes / 100,
      availability: `https://schema.org/${product.availability}`,
      seller: { '@type': 'Organization', name: 'Oda Commerce' },
    },
    ...(product.ratingValue && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount ?? 0,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationStructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Oda Commerce',
    url: 'https://oda.co.ke',
    logo: 'https://oda.co.ke/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+254-800-000-000',
      contactType: 'customer support',
      areaServed: 'KE',
      availableLanguage: ['English', 'Swahili'],
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Nairobi',
      addressCountry: 'KE',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbStructuredData({ items }: { items: Array<{ name: string; url: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
