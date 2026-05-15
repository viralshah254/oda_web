export default function AdminAnalyticsPage() {
  const metrics = [
    { label: 'Total Orders (MTD)', value: '3,240', change: '+22%' },
    { label: 'Gross Revenue (KES)', value: '9,240,000', change: '+18%' },
    { label: 'Avg Order Value (KES)', value: '2,852', change: '+3%' },
    { label: 'Active Customers', value: '1,480', change: '+9%' },
    { label: 'Repeat Rate', value: '64%', change: '+4pp' },
    { label: 'Avg Delivery Time (min)', value: '28', change: '-2 min' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-8">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {metrics.map((m) => (
          <div key={m.label} className="bg-white rounded-2xl p-5 border border-[#E8E8E0]">
            <p className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{m.value}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-[#666] font-plus-jakarta">{m.label}</p>
              <span className="text-xs font-bold text-green-600 font-plus-jakarta">{m.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E8E0] p-6">
        <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">Top Categories by Revenue</h2>
        {[
          { name: 'Groceries & Kitchen', revenue: 3200000, pct: 35 },
          { name: 'Snacks & Drinks', revenue: 1800000, pct: 20 },
          { name: 'Beauty & Personal Care', revenue: 1350000, pct: 15 },
          { name: 'Household Essentials', revenue: 900000, pct: 10 },
          { name: 'Health & Wellness', revenue: 720000, pct: 8 },
        ].map((cat) => (
          <div key={cat.name} className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-[#1A1A1A] font-plus-jakarta">{cat.name}</span>
              <span className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">KES {(cat.revenue / 1000).toFixed(0)}K</span>
            </div>
            <div className="h-2 bg-[#F5F5F0] rounded-full overflow-hidden">
              <div className="h-full bg-[#198A2E] rounded-full transition-all" style={{ width: `${cat.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
