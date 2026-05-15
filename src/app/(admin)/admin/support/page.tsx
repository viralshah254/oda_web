'use client';

import { useState } from 'react';
import { MessageSquare, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

const tickets = [
  { id: 'TKT-001', customer: 'Amina Wanjiku', phone: '+254712345', subject: 'Order ORD-1001 not delivered', priority: 'HIGH', status: 'OPEN', orderId: 'ORD-1001', time: '10 min ago' },
  { id: 'TKT-002', customer: 'Brian Otieno', phone: '+254722345', subject: 'Wrong item received', priority: 'MEDIUM', status: 'IN_PROGRESS', orderId: 'ORD-0998', time: '22 min ago' },
  { id: 'TKT-003', customer: 'Catherine Njeri', phone: '+254733345', subject: 'M-Pesa payment deducted but order not placed', priority: 'CRITICAL', status: 'OPEN', orderId: null, time: '35 min ago' },
  { id: 'TKT-004', customer: 'David Mwangi', phone: '+254744345', subject: 'Refund not received after 3 days', priority: 'HIGH', status: 'WAITING_ON_AGENT', orderId: 'ORD-0982', time: '1 hour ago' },
];

const priorityConfig: Record<string, { color: string; icon: any }> = {
  CRITICAL: { color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  HIGH: { color: 'bg-orange-100 text-orange-700', icon: AlertTriangle },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  LOW: { color: 'bg-gray-100 text-gray-600', icon: MessageSquare },
};

const statusConfig: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  WAITING_ON_AGENT: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
};

export default function AdminSupportPage() {
  const [selected, setSelected] = useState<typeof tickets[0] | null>(null);

  return (
    <div className="flex h-full">
      {/* Left: Ticket List */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">Support Tickets</h1>
          <div className="flex gap-2 text-sm font-plus-jakarta">
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold">3 Open</span>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold">1 Critical</span>
          </div>
        </div>

        <div className="space-y-3">
          {tickets.map((ticket) => {
            const PriorityIcon = priorityConfig[ticket.priority].icon;
            return (
              <div
                key={ticket.id}
                onClick={() => setSelected(ticket)}
                className={`bg-white rounded-2xl border p-4 cursor-pointer hover:border-[#198A2E]/30 transition-colors ${selected?.id === ticket.id ? 'border-[#198A2E]' : 'border-[#E8E8E0]'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#999] font-mono">{ticket.id}</span>
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${priorityConfig[ticket.priority].color}`}>
                      <PriorityIcon size={10} />
                      {ticket.priority}
                    </span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full font-plus-jakarta ${statusConfig[ticket.status]}`}>
                    {ticket.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta mb-1">{ticket.subject}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#999] font-plus-jakarta">{ticket.customer} · {ticket.orderId ?? 'No order'}</p>
                  <p className="text-xs text-[#999] font-plus-jakarta">{ticket.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Ticket Detail */}
      {selected ? (
        <div className="w-96 border-l border-[#E8E8E0] p-6 overflow-y-auto bg-white">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta mb-4">{selected.subject}</h2>
          <div className="space-y-3 mb-6">
            {[
              ['Customer', selected.customer],
              ['Phone', selected.phone],
              ['Order', selected.orderId ?? '—'],
              ['Priority', selected.priority],
              ['Status', selected.status.replace(/_/g, ' ')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm font-plus-jakarta">
                <span className="text-[#999]">{label}</span>
                <span className="font-semibold text-[#1A1A1A]">{value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <button className="w-full bg-[#198A2E] text-white py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#166b24] transition-colors">
              Reply to Customer
            </button>
            <button className="w-full bg-[#F5F5F0] text-[#1A1A1A] py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#E8E8E0] transition-colors">
              Issue Wallet Credit
            </button>
            <button className="w-full bg-[#F5F5F0] text-[#1A1A1A] py-2.5 rounded-xl text-sm font-bold font-plus-jakarta hover:bg-[#E8E8E0] transition-colors">
              Escalate
            </button>
            <button className="w-full bg-green-50 text-green-700 py-2.5 rounded-xl text-sm font-bold font-plus-jakarta">
              Mark Resolved
            </button>
          </div>
        </div>
      ) : (
        <div className="w-96 border-l border-[#E8E8E0] flex items-center justify-center bg-[#F9F9F6]">
          <div className="text-center">
            <MessageSquare size={32} className="text-[#CCC] mx-auto mb-2" />
            <p className="text-sm text-[#999] font-plus-jakarta">Select a ticket to view details</p>
          </div>
        </div>
      )}
    </div>
  );
}
