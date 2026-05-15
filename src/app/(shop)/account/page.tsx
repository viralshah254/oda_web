'use client';

import { User, MapPin, Package, Wallet, Star, RefreshCw, Ticket, Heart, Share2, Settings, LogOut, ChevronRight } from 'lucide-react';

const menuItems = [
  { icon: Package, label: 'My Orders', href: '/orders', sub: '3 orders this month' },
  { icon: MapPin, label: 'Saved Addresses', href: '/account/addresses', sub: '2 addresses' },
  { icon: Wallet, label: 'Oda Wallet', href: '/account/wallet', sub: 'Balance: KES 500' },
  { icon: Star, label: 'Loyalty Points', href: '/account/loyalty', sub: '240 points' },
  { icon: RefreshCw, label: 'Recurring Cart', href: '/account/recurring', sub: '1 active schedule' },
  { icon: Ticket, label: 'Support Tickets', href: '/account/tickets', sub: 'No open tickets' },
  { icon: Heart, label: 'Saved Lists', href: '/account/lists', sub: '1 list' },
  { icon: Share2, label: 'Refer a Friend', href: '/account/referrals', sub: 'Earn KES 200 per referral' },
  { icon: Settings, label: 'Settings', href: '/account/settings', sub: null },
];

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F0]">
      <div className="bg-white border-b border-[#E8E8E0] px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-4">Account</h1>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EBF9EE] flex items-center justify-center">
              <User size={24} className="text-[#198A2E]" />
            </div>
            <div>
              <p className="text-base font-extrabold text-[#1A1A1A] font-plus-jakarta">Amina Wanjiku</p>
              <p className="text-sm text-[#666] font-plus-jakarta">+254 712 345 678</p>
              <span className="inline-block mt-1 text-xs font-bold text-[#198A2E] bg-[#EBF9EE] px-2 py-0.5 rounded-full font-plus-jakarta">
                B2C Customer
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4 space-y-2">
        {menuItems.map(({ icon: Icon, label, href, sub }) => (
          <a key={label} href={href} className="flex items-center gap-4 bg-white rounded-xl border border-[#E8E8E0] px-4 py-3.5 hover:border-[#198A2E]/30 transition-colors">
            <div className="w-9 h-9 bg-[#F5F5F0] rounded-lg flex items-center justify-center">
              <Icon size={16} className="text-[#444]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{label}</p>
              {sub && <p className="text-xs text-[#999] font-plus-jakarta">{sub}</p>}
            </div>
            <ChevronRight size={16} className="text-[#CCC]" />
          </a>
        ))}
        <button className="flex items-center gap-4 w-full bg-white rounded-xl border border-[#E8E8E0] px-4 py-3.5 hover:border-red-200 transition-colors">
          <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center">
            <LogOut size={16} className="text-red-500" />
          </div>
          <p className="text-sm font-semibold text-red-500 font-plus-jakarta">Sign Out</p>
        </button>
      </div>
    </div>
  );
}
