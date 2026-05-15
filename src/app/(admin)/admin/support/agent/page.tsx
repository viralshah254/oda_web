'use client';

import { useState } from 'react';
import { MessageSquare, Phone, Globe, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

type Channel = 'CHAT' | 'CALL' | 'WHATSAPP';

interface Message {
  id: string;
  from: 'agent' | 'customer';
  text: string;
  time: string;
  channel: Channel;
}

const mockMessages: Message[] = [
  { id: '1', from: 'customer', text: 'Hi, I ordered ORD-1001 and it has been 2 hours with no update', time: '10:22 AM', channel: 'CHAT' },
  { id: '2', from: 'agent', text: 'Hello! I\'m sorry about that. Let me check on your order right away.', time: '10:23 AM', channel: 'CHAT' },
  { id: '3', from: 'customer', text: 'I paid via M-Pesa and money was deducted but no confirmation', time: '10:23 AM', channel: 'CHAT' },
];

const orderContext = {
  orderId: 'ORD-1001',
  status: 'PAYMENT_CONFIRMED',
  totalKes: 1850,
  items: ['Unga Jogoo 2kg', 'Brookside Milk 1L', 'Salit Cooking Oil 2L'],
  payment: { method: 'MPESA', receipt: 'QJ34567KL', status: 'CONFIRMED' },
  branch: 'Westlands Branch',
  rider: null,
};

export default function SupportAgentPage() {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState('');
  const [activeChannel, setActiveChannel] = useState<Channel>('CHAT');
  const [refundAmount, setRefundAmount] = useState('');

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), from: 'agent', text: input, time: new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' }), channel: activeChannel },
    ]);
    setInput('');
  };

  return (
    <div className="flex h-full">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8E8E0] flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">TKT-003 — Amina Wanjiku</h2>
            <p className="text-xs text-[#999] font-plus-jakarta">+254712345678 · 35 min ago · HIGH priority</p>
          </div>
          <div className="flex gap-2">
            {(['CHAT', 'CALL', 'WHATSAPP'] as Channel[]).map((ch) => (
              <button
                key={ch}
                onClick={() => setActiveChannel(ch)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-plus-jakarta flex items-center gap-1.5 ${activeChannel === ch ? 'bg-[#198A2E] text-white' : 'bg-[#F5F5F0] text-[#666]'}`}
              >
                {ch === 'CHAT' ? <MessageSquare size={12} /> : ch === 'CALL' ? <Phone size={12} /> : <Globe size={12} />}
                {ch}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-[#F9F9F6]">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'agent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-sm px-4 py-2.5 rounded-2xl text-sm font-plus-jakarta ${msg.from === 'agent' ? 'bg-[#198A2E] text-white rounded-br-sm' : 'bg-white border border-[#E8E8E0] text-[#1A1A1A] rounded-bl-sm'}`}>
                <p>{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.from === 'agent' ? 'text-white/60' : 'text-[#999]'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-[#E8E8E0] bg-white flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Reply via ${activeChannel}...`}
            className="flex-1 bg-[#F5F5F0] rounded-xl px-4 py-2.5 text-sm font-plus-jakarta outline-none"
          />
          <button onClick={send} className="bg-[#198A2E] text-white px-4 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta">
            Send
          </button>
        </div>
      </div>

      {/* Right: Context Panel */}
      <div className="w-80 border-l border-[#E8E8E0] overflow-y-auto bg-white">
        {/* Order Context */}
        <div className="p-5 border-b border-[#E8E8E0]">
          <h3 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3 font-plus-jakarta">Order Context</h3>
          <div className="space-y-2">
            {[
              ['Order', orderContext.orderId],
              ['Status', orderContext.status.replace(/_/g, ' ')],
              ['Total', `KES ${orderContext.totalKes.toLocaleString()}`],
              ['Branch', orderContext.branch],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-plus-jakarta">
                <span className="text-[#999]">{k}</span>
                <span className="font-semibold text-[#1A1A1A]">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <p className="text-xs font-bold text-[#999] mb-1 font-plus-jakarta">Items</p>
            {orderContext.items.map((item) => (
              <p key={item} className="text-xs text-[#666] font-plus-jakarta">• {item}</p>
            ))}
          </div>
        </div>

        {/* Payment Context */}
        <div className="p-5 border-b border-[#E8E8E0]">
          <h3 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3 font-plus-jakarta">Payment</h3>
          <div className="space-y-2">
            {[
              ['Method', orderContext.payment.method],
              ['Receipt', orderContext.payment.receipt],
              ['Status', orderContext.payment.status],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs font-plus-jakarta">
                <span className="text-[#999]">{k}</span>
                <span className={`font-semibold ${v === 'CONFIRMED' ? 'text-[#198A2E]' : 'text-[#1A1A1A]'}`}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-5">
          <h3 className="text-xs font-bold text-[#999] uppercase tracking-wider mb-3 font-plus-jakarta">Quick Actions</h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="KES amount"
                className="flex-1 bg-[#F5F5F0] rounded-xl px-3 py-2 text-xs font-plus-jakarta outline-none"
              />
              <button className="bg-[#198A2E] text-white px-3 py-2 rounded-xl text-xs font-bold font-plus-jakarta">
                Refund
              </button>
            </div>
            <button className="w-full bg-[#F5F5F0] text-[#1A1A1A] py-2 rounded-xl text-xs font-bold font-plus-jakarta hover:bg-[#E8E8E0] flex items-center justify-center gap-2">
              <RefreshCw size={12} /> Resend Order Update
            </button>
            <button className="w-full bg-[#F5F5F0] text-[#1A1A1A] py-2 rounded-xl text-xs font-bold font-plus-jakarta hover:bg-[#E8E8E0] flex items-center justify-center gap-2">
              <AlertCircle size={12} /> Escalate to Senior
            </button>
            <button className="w-full bg-green-50 text-green-700 py-2 rounded-xl text-xs font-bold font-plus-jakarta flex items-center justify-center gap-2">
              <CheckCircle size={12} /> Mark Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
