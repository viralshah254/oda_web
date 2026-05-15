import Link from 'next/link';

const categories = [
  { emoji: '🥦', name: 'Groceries & Kitchen', slug: 'groceries', count: '500+ products' },
  { emoji: '🍿', name: 'Snacks & Drinks', slug: 'snacks', count: '300+ products' },
  { emoji: '💄', name: 'Beauty & Personal Care', slug: 'beauty', count: '250+ products' },
  { emoji: '🧹', name: 'Household Essentials', slug: 'household', count: '200+ products' },
  { emoji: '💊', name: 'Health & Wellness', slug: 'health', count: '150+ products' },
  { emoji: '👶', name: 'Baby & Toddler', slug: 'baby', count: '100+ products' },
  { emoji: '🐾', name: 'Pet Care', slug: 'pet', count: '80+ products' },
  { emoji: '⚡', name: 'Electronics & Accessories', slug: 'electronics', count: '200+ products' },
  { emoji: '🎒', name: 'School Supplies', slug: 'school', count: '120+ products' },
  { emoji: '🏋️', name: 'Sports & Fitness', slug: 'sports', count: '90+ products' },
  { emoji: '🍦', name: 'Ice Cream & Frozen', slug: 'frozen', count: '60+ products' },
  { emoji: '🌿', name: 'Organic & Natural', slug: 'organic', count: '100+ products' },
  { emoji: '📱', name: 'Airtime & Data', slug: 'airtime', count: '20+ products' },
  { emoji: '🇰🇪', name: 'Kenya Specials', slug: 'kenya', count: '150+ products' },
];

export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-5">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">All Categories</h1>
          <p className="text-sm text-[#666] mt-1 font-plus-jakarta">Browse everything Oda delivers in ~30 minutes</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className="bg-white rounded-2xl border border-[#E8E8E0] p-5 text-center hover:border-[#198A2E] hover:shadow-md transition-all group"
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>
              <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta leading-tight group-hover:text-[#198A2E] transition-colors">{cat.name}</p>
              <p className="text-xs text-[#999] mt-1 font-plus-jakarta">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
