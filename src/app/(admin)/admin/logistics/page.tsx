'use client';

import { MapPin, Zap, Clock, AlertCircle } from 'lucide-react';

const riders = [
  { id: 'R001', name: 'James Mwangi', phone: '+254712000001', status: 'IN_TRANSIT', orderId: 'ORD-1001', zone: 'Westlands', eta: 8 },
  { id: 'R002', name: 'Peter Kiprotich', phone: '+254712000002', status: 'PICKING_UP', orderId: 'ORD-1003', zone: 'Kilimani', eta: 5 },
  { id: 'R003', name: 'Mary Achieng', phone: '+254712000003', status: 'IDLE', orderId: null, zone: 'CBD', eta: null },
  { id: 'R004', name: 'John Kamau', phone: '+254712000004', status: 'IN_TRANSIT', orderId: 'ORD-1005', zone: 'Karen', eta: 14 },
  { id: 'R005', name: 'Grace Mutua', phone: '+254712000005', status: 'OFFLINE', orderId: null, zone: null, eta: null },
];

const statusConfig: Record<string, { color: string; dot: string; label: string }> = {
  IN_TRANSIT: { color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'In Transit' },
  PICKING_UP: { color: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', label: 'Picking Up' },
  IDLE: { color: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'Available' },
  OFFLINE: { color: 'bg-gray-100 text-gray-500', dot: 'bg-gray-400', label: 'Offline' },
};

export default function AdminLogisticsPage() {
  const active = riders.filter((r) => ['IN_TRANSIT', 'PICKING_UP'].includes(r.status));
  const idle = riders.filter((r) => r.status === 'IDLE');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta mb-6">Logistics Command</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Riders', value: active.length, icon: Zap, color: 'text-[#198A2E]' },
          { label: 'Available', value: idle.length, icon: MapPin, color: 'text-blue-600' },
          { label: 'Active Trips', value: active.length, icon: Clock, color: 'text-orange-600' },
          { label: 'Delayed Orders', value: '0', icon: AlertCircle, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-[#E8E8E0] p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <p className="text-xs text-[#999] font-plus-jakarta">{s.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-[#1A1A1A] font-plus-jakarta">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E0] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E8E0]">
          <h2 className="text-base font-bold text-[#1A1A1A] font-plus-jakarta">Live Riders</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E8E0]">
              {['Rider', 'Status', 'Active Order', 'Zone', 'ETA (min)'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-[#999] px-5 py-3 font-plus-jakarta">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E8E0]">
            {riders.map((rider) => {
              const config = statusConfig[rider.status];
              return (
                <tr key={rider.id} className="hover:bg-[#F9F9F6]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#EBF9EE] flex items-center justify-center">
                        <span className="text-xs font-bold text-[#198A2E] font-plus-jakarta">{rider.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A] font-plus-jakarta">{rider.name}</p>
                        <p className="text-xs text-[#999] font-plus-jakarta">{rider.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full font-plus-jakarta w-fit ${config.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-[#198A2E] font-bold font-plus-jakarta">{rider.orderId ?? '—'}</td>
                  <td className="px-5 py-3 text-sm text-[#666] font-plus-jakarta">{rider.zone ?? '—'}</td>
                  <td className="px-5 py-3 text-sm font-bold text-[#1A1A1A] font-plus-jakarta">{rider.eta ? `~${rider.eta} min` : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
