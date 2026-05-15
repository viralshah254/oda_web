import Link from 'next/link';
import { ChevronRight, Package, TrendingUp, Shield, Zap } from 'lucide-react';

export default function SupplierLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#1A1A1A] text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold bg-[#198A2E] text-white px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Supplier Partner Program
            </span>
            <h1 className="text-4xl font-extrabold font-plus-jakarta leading-tight mb-4">
              Sell on Oda.<br />
              <span className="text-[#198A2E]">Reach more customers.</span>
            </h1>
            <p className="text-white/70 font-plus-jakarta text-lg mb-8">
              Partner with Oda to distribute your products to thousands of consumers and businesses across Kenya. Fast payments, real-time stock sync, and ERP integration.
            </p>
            <Link
              href="/supplier/apply"
              className="inline-flex items-center gap-2 bg-[#F8C915] text-[#1A1A1A] px-8 py-4 rounded-xl font-extrabold text-lg font-plus-jakarta hover:bg-[#e6b914] transition-colors"
            >
              Apply Now <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8 text-center">Why partner with Oda?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Zap, title: 'Fast Settlement', desc: 'Get paid within 7 days of delivery. Transparent ledger with full audit trail.' },
            { icon: Package, title: 'ERP Integration', desc: 'Seamless sync with Dynamics 365, QuickBooks, and Sage. No manual data entry.' },
            { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track sales velocity, stock levels, and branch performance in one dashboard.' },
            { icon: Shield, title: 'Protected Margins', desc: 'Your cost prices are encrypted and never shared. You set the floor price.' },
          ].map((b) => (
            <div key={b.title} className="bg-[#F5F5F0] rounded-2xl p-6">
              <b.icon size={24} className="text-[#198A2E] mb-3" />
              <h3 className="text-base font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">{b.title}</h3>
              <p className="text-sm text-[#666] font-plus-jakarta">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="bg-[#F5F5F0] py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Apply Online', desc: 'Fill out our supplier form and submit your documents' },
              { step: '2', title: 'Onboarding', desc: 'Oda team sets up your branches and integrates your ERP' },
              { step: '3', title: 'Go Live', desc: 'Your products appear on Oda for thousands of customers' },
              { step: '4', title: 'Grow', desc: 'Use analytics to optimize pricing, stock, and campaigns' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-[#198A2E] rounded-full flex items-center justify-center text-white font-extrabold font-plus-jakarta text-lg mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta mb-1">{s.title}</h3>
                <p className="text-xs text-[#666] font-plus-jakarta">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-4">Ready to grow with Oda?</h2>
          <p className="text-[#666] font-plus-jakarta mb-8">Join dozens of suppliers already reaching customers across Nairobi and beyond.</p>
          <Link
            href="/supplier/apply"
            className="inline-flex items-center gap-2 bg-[#198A2E] text-white px-10 py-4 rounded-xl font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors text-lg"
          >
            Get Started <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
}
