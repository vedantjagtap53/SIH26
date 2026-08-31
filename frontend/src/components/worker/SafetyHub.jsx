import React from 'react';
import BentoCard from '../BentoCard';
import { Megaphone } from 'lucide-react';

export default function SafetyHub({ broadcasts }) {
  const relevantBroadcasts = broadcasts.filter(b => b.targetAudience === 'ALL' || b.targetAudience === 'WORKERS');

  return (
    <BentoCard title="Headquarters Alerts & Broadcasts" icon={<Megaphone size={20} />}>
      <div className="space-y-4">
        {relevantBroadcasts.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No recent alerts.</p>
        ) : relevantBroadcasts.map(b => (
          <div key={b.id} className="p-4 border border-indigo-100 rounded-xl bg-indigo-50/30">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-sm text-gray-900">{b.title}</span>
              <span className="text-[10px] font-mono text-gray-500">{new Date(b.timestamp ? b.timestamp.toMillis() : Date.now()).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-700">{b.message}</p>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
