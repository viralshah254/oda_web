import Link from 'next/link';
import { ChevronRight, BarChart3, Target, Users, Globe } from 'lucide-react';

export default function ManufacturerLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#1565C0] text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold bg-[#F8C915] text-[#1A1A1A] px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Brand & Manufacturer Platform
            </span>
            <h1 className="text-4xl font-extrabold font-plus-jakarta leading-tight mb-4">
              Advertise where Kenya shops.<br />
              <span className="text-[#F8C915]">Measure what matters.</span>
            </h1>
            <p className="text-white/80 font-plus-jakarta text-lg mb-8">
              Put your brand in front of thousands of active shoppers on Oda. Run targeted campaigns, sponsor products, and track real purchase impact.
            </p>
            <Link
              href="/manufacturer/apply"
              className="inline-flex items-center gap-2 bg-[#F8C915] text-[#1A1A1A] px-8 py-4 rounded-xl font-extrabold text-lg font-plus-jakarta hover:bg-[#e6b914] transition-colors"
            >
              Partner with Us <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8 text-center">Advertising formats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { title: 'Sponsored Products', desc: 'Your products appear first in search results and category grids. Pay per click or per order.' },
            { title: 'Homepage Carousel', desc: 'Full-width brand moment on the Oda homepage, seen by every shopper as they open the app.' },
            { title: 'Category Banners', desc: 'Own the banner at the top of your product category. High visibility, targeted audience.' },
            { title: 'Flash Deals', desc: 'Drive urgency with time-limited offers featured prominently in the deals section.' },
          ].map((f) => (
            <div key={f.title} className="bg-[#F5F5F0] rounded-2xl p-6">
              <h3 className="text-base font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">{f.title}</h3>
              <p className="text-sm text-[#666] font-plus-jakarta leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
