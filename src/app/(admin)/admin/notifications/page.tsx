'use client';

import { useState } from 'react';
import { Bell, MessageSquare, Phone, Mail, Send } from 'lucide-react';

const templates = [
  { id: 'otp', name: 'OTP Verification', channel: 'SMS', trigger: 'Auth', preview: 'Your Oda OTP: {{otp}}. Expires in 5 min. Do not share.' },
  { id: 'order-confirmed', name: 'Order Confirmed', channel: 'PUSH', trigger: 'Order placed', preview: '✅ ORD-{{orderId}} confirmed. Preparing your order now!' },
  { id: 'rider-assigned', name: 'Rider Assigned', channel: 'PUSH', trigger: 'Rider matched', preview: '🛵 Your rider {{riderName}} is on the way! ETA: {{eta}} min.' },
  { id: 'delivered', name: 'Order Delivered', channel: 'WHATSAPP', trigger: 'Delivery complete', preview: 'Hi {{name}}! Your Oda order has been delivered. Receipt: {{receiptLink}}' },
  { id: 'payment-failed', name: 'Payment Failed', channel: 'SMS', trigger: 'Payment failure', preview: 'Your M-Pesa payment for ORD-{{orderId}} failed. Tap to retry.' },
  { id: 'promo', name: 'Promotional Offer', channel: 'PUSH', trigger: 'Manual/Campaign', preview: '🎁 Flash Sale! {{discount}}% off {{category}} today only. Shop now.' },
];

const channelConfig: Record<string, { icon: any; color: string }> = {
  PUSH: { icon: Bell, color: 'bg-blue-100 text-blue-700' },
  SMS: { icon: Phone, color: 'bg-green-100 text-green-700' },
  WHATSAPP: { icon: MessageSquare, color: 'bg-green-100 text-green-700' },
  EMAIL: { icon: Mail, color: 'bg-purple-100 text-purple-700' },
};

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'templates' | 'campaigns' | 'logs'>('templates');
  const [selected, setSelected] = useState<typeof templates[0] | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Notifications</h1>

      <div className="flex gap-2 mb-6">
        {(['templates', 'campaigns', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-bold font-plus-jakarta capitalize ${activeTab === tab ? 'bg-[#1A1A1A] text-white' : 'bg-white border border-[#E8E8E0] text-[#666]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'templates' && (
        <div className="flex gap-6">
          <div className="flex-1 space-y-3">
            {templates.map((t) => {
              const config = channelConfig[t.channel];
              const Icon = config.icon;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelected(t)}
                  className={`bg-white rounded-2xl border p-4 cursor-pointer hover:border-[#198A2E]/30 ${selected?.id === t.id ? 'border-[#198A2E]' : 'border-[#E8E8E0]'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${config.color}`}>
                        <Icon size={10} />
                        {t.channel}
                      </span>
                      <p className="text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{t.name}</p>
                    </div>
                    <span className="text-xs text-[#999] font-plus-jakarta">{t.trigger}</span>
                  </div>
                  <p className="text-xs text-[#666] font-plus-jakarta truncate">{t.preview}</p>
                </div>
              );
            })}
          </div>

          {selected && (
            <div className="w-80 bg-white rounded-2xl border border-[#E8E8E0] p-5 h-fit">
              <h3 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">{selected.name}</h3>
              <div className="bg-[#F5F5F0] rounded-xl p-4 text-sm text-[#666] font-plus-jakarta mb-4 font-mono leading-relaxed">
                {selected.preview}
              </div>
              <div className="space-y-2">
                <button className="w-full bg-[#198A2E] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] flex items-center justify-center gap-2">
                  <Send size={14} /> Send Test
                </button>
                <button className="w-full bg-[#F5F5F0] text-[#1A1A1A] py-2.5 rounded-xl text-sm font-bold font-plus-jakarta">
                  Edit Template
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] p-8 text-center">
          <Bell size={32} className="text-[#CCC] mx-auto mb-3" />
          <p className="text-sm font-bold font-plus-jakarta text-[#1A1A1A]">No campaigns sent</p>
          <button className="mt-4 bg-[#198A2E] text-white px-5 py-2 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24]">
            Create Campaign
          </button>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E8E8E0]">
                {['Time', 'Template', 'Channel', 'Recipient', 'Status'].map((h) => (
                  <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, i) => (
                <tr key={i} className="border-b border-[#E8E8E0] hover:bg-[#F9F9F6]">
                  <td className="px-5 py-3 text-xs text-[#999] font-plus-jakarta">{new Date(Date.now() - i * 3 * 60 * 1000).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{templates[i % templates.length].name}</td>
                  <td className="px-5 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${channelConfig[templates[i % templates.length].channel].color}`}>{templates[i % templates.length].channel}</span></td>
                  <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">+2547{(1000 + i * 11).toString()}xxx</td>
                  <td className="px-5 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-plus-jakarta">DELIVERED</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
