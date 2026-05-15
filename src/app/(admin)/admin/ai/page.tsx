'use client';

import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, ShoppingCart, BarChart3 } from 'lucide-react';

const insights = [
  {
    id: 'fraud-1',
    type: 'FRAUD',
    severity: 'HIGH',
    title: 'Unusual return pattern detected',
    description: 'Customer CUST-4421 has made 8 returns in 14 days, totaling KES 12,000. Pattern indicates potential return abuse.',
    entity: 'Customer CUST-4421',
    action: 'Review account',
    time: '2 hours ago',
  },
  {
    id: 'price-1',
    type: 'PRICE_ANOMALY',
    severity: 'MEDIUM',
    title: 'Price anomaly: Cooking Oil',
    description: 'Brookside Cooking Oil 2L is priced 38% above market average across competitor platforms.',
    entity: 'SKU: COOK-OIL-2L',
    action: 'Review pricing',
    time: '5 hours ago',
  },
  {
    id: 'demand-1',
    type: 'DEMAND',
    severity: 'INFO',
    title: 'High demand forecast: Back to school',
    description: 'School supplies category predicted to see 3x normal demand in next 7 days. Ensure adequate stock.',
    entity: 'School Supplies',
    action: 'Notify branches',
    time: '6 hours ago',
  },
  {
    id: 'rider-1',
    type: 'RIDER_RISK',
    severity: 'MEDIUM',
    title: 'Rider performance degradation',
    description: 'Rider R-0012 (James Mwangi) on-time rate dropped from 94% to 67% this week. 3 incidents filed.',
    entity: 'Rider R-0012',
    action: 'Contact rider',
    time: 'Yesterday',
  },
  {
    id: 'margin-1',
    type: 'MARGIN',
    severity: 'HIGH',
    title: 'Margin leakage detected',
    description: '14 products in Dairy category are being sold below margin floor after coupon application. Total leakage: KES 45,000/week.',
    entity: 'Dairy Category',
    action: 'Fix pricing rules',
    time: '1 day ago',
  },
];

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  FRAUD: { icon: AlertTriangle, color: 'bg-red-100 text-red-700', label: 'Fraud Signal' },
  PRICE_ANOMALY: { icon: TrendingUp, color: 'bg-orange-100 text-orange-700', label: 'Price Anomaly' },
  DEMAND: { icon: ShoppingCart, color: 'bg-blue-100 text-blue-700', label: 'Demand Forecast' },
  RIDER_RISK: { icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-700', label: 'Rider Risk' },
  MARGIN: { icon: BarChart3, color: 'bg-purple-100 text-purple-700', label: 'Margin Alert' },
};

const severityColor: Record<string, string> = {
  HIGH: 'border-l-4 border-red-500',
  MEDIUM: 'border-l-4 border-yellow-500',
  INFO: 'border-l-4 border-blue-400',
};

export default function AdminAIPage() {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  const filtered = activeFilter === 'ALL' ? insights : insights.filter((i) => i.type === activeFilter);

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-[#EBF9EE] rounded-xl flex items-center justify-center">
          <Brain size={20} className="text-[#198A2E]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">AI Insights</h1>
          <p className="text-xs text-[#999] font-plus-jakarta">{insights.length} active signals</p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {[
          { label: 'All', value: 'ALL', count: insights.length },
          { label: 'Fraud', value: 'FRAUD', count: insights.filter((i) => i.type === 'FRAUD').length },
          { label: 'Price', value: 'PRICE_ANOMALY', count: insights.filter((i) => i.type === 'PRICE_ANOMALY').length },
          { label: 'Margin', value: 'MARGIN', count: insights.filter((i) => i.type === 'MARGIN').length },
          { label: 'Riders', value: 'RIDER_RISK', count: insights.filter((i) => i.type === 'RIDER_RISK').length },
          { label: 'Demand', value: 'DEMAND', count: insights.filter((i) => i.type === 'DEMAND').length },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta flex items-center gap-2 ${
              activeFilter === f.value ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'
            }`}
          >
            {f.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeFilter === f.value ? 'bg-white/20 text-white' : 'bg-[#F5F5F0] text-[#999]'}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Insights list */}
      <div className="space-y-4">
        {filtered.map((insight) => {
          const config = typeConfig[insight.type];
          const Icon = config.icon;
          return (
            <div key={insight.id} className={`bg-white rounded-2xl p-5 ${severityColor[insight.severity]}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta ${config.color}`}>
                    <Icon size={12} />
                    {config.label}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${insight.severity === 'HIGH' ? 'bg-red-100 text-red-700' : insight.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                    {insight.severity}
                  </span>
                </div>
                <span className="text-xs text-[#999] font-plus-jakarta">{insight.time}</span>
              </div>

              <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-1">{insight.title}</h3>
              <p className="text-sm text-[#666] font-plus-jakarta mb-3 leading-relaxed">{insight.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-xs bg-[#F5F5F0] text-[#666] px-2 py-1 rounded-lg font-plus-jakarta">{insight.entity}</span>
                <button className="text-xs font-bold text-[#198A2E] font-plus-jakarta hover:underline">
                  {insight.action} →
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Brain size={32} className="text-[#CCC] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">No signals for this category</p>
            <p className="text-xs text-[#999] font-plus-jakarta mt-1">All clear ✓</p>
          </div>
        )}
      </div>
    </div>
  );
}
