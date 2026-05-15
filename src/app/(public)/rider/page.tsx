import Link from 'next/link';
import { ChevronRight, DollarSign, Clock, Star, Smartphone } from 'lucide-react';

export default function RiderLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#198A2E] text-white py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold bg-white text-[#198A2E] px-3 py-1.5 rounded-full mb-4 font-plus-jakarta">
              Ride with Oda 🏍️
            </span>
            <h1 className="text-4xl font-extrabold font-plus-jakarta leading-tight mb-4">
              Deliver with Oda.<br />
              Earn on your schedule.
            </h1>
            <p className="text-white/80 font-plus-jakarta text-lg mb-8">
              Join Oda's growing network of delivery riders in Nairobi. Earn competitive pay, get weekly M-Pesa payouts, and work the hours that suit you.
            </p>
            <Link
              href="/rider/apply"
              className="inline-flex items-center gap-2 bg-[#F8C915] text-[#1A1A1A] px-8 py-4 rounded-xl font-extrabold text-lg font-plus-jakarta hover:bg-[#e6b914] transition-colors"
            >
              Apply to Ride <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Earnings Highlight */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-3 gap-6 text-center mb-16">
          {[
            { value: 'KES 1,500+', label: 'Avg daily earnings' },
            { value: '7 days', label: 'M-Pesa payout' },
            { value: 'You choose', label: 'Your working hours' },
          ].map((s) => (
            <div key={s.label} className="bg-[#EBF9EE] rounded-2xl p-8">
              <p className="text-2xl font-extrabold text-[#198A2E] font-plus-jakarta">{s.value}</p>
              <p className="text-sm text-[#444] font-plus-jakarta mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8 text-center">What you get</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: DollarSign, title: 'Competitive Pay', desc: 'Base pay per delivery + distance bonus + surge pricing during peak hours' },
            { icon: Clock, title: 'Flexible Hours', desc: 'Work mornings, evenings, or weekends — you set your schedule' },
            { icon: Star, title: 'Bonuses & Rewards', desc: 'Weekly performance bonuses for high ratings and on-time delivery' },
            { icon: Smartphone, title: 'Smart App', desc: 'Easy-to-use delivery app with maps, customer contact, and instant earnings view' },
          ].map((b) => (
            <div key={b.title} className="bg-[#F5F5F0] rounded-2xl p-6">
              <b.icon size={24} className="text-[#198A2E] mb-3" />
              <h3 className="text-sm font-extrabold text-[#1A1A1A] font-plus-jakarta mb-2">{b.title}</h3>
              <p className="text-xs text-[#666] font-plus-jakarta leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-[#F5F5F0] py-12">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6 text-center">What you need to apply</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {['Valid National ID', 'Driving License', 'Smartphone (Android/iOS)', 'Insurance Certificate', 'Road Worthy Boda/Tuk-tuk', 'Clean driving record'].map((req) => (
              <div key={req} className="bg-white rounded-xl p-4 flex items-center gap-3">
                <span className="text-[#198A2E]">✓</span>
                <span className="text-sm font-medium text-[#444] font-plus-jakarta">{req}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/rider/apply"
              className="inline-flex items-center gap-2 bg-[#198A2E] text-white px-10 py-4 rounded-xl font-extrabold font-plus-jakarta hover:bg-[#166b24] transition-colors"
            >
              Start Application <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
