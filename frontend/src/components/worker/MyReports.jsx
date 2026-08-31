import React from 'react';
import BentoCard from '../BentoCard';
import { ClipboardList } from 'lucide-react';

export default function MyReports({ incidents }) {
  return (
    <BentoCard title="My Submitted Hazard Reports" icon={<ClipboardList size={20} />}>
      <div className="space-y-4">
        {incidents.length === 0 ? (
          <p className="text-center py-8 text-xs text-gray-500">You haven't reported any hazards yet.</p>
        ) : incidents.map(inc => (
          <div key={inc.id} className="border border-gray-100 rounded-xl p-4 bg-white flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-sm text-gray-900">{inc.hazardType}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${inc.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                  {inc.severity}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2">{inc.description}</p>
              <span className="text-[10px] bg-slate-50 border border-gray-100 px-2 py-1 rounded-md text-gray-500">
                Location: {inc.location}
              </span>
            </div>
            <div className="shrink-0 text-right">
              <span className={`block px-3 py-1 rounded-lg text-[10px] font-black uppercase ${inc.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {inc.status || 'UNRESOLVED'}
              </span>
              <span className="text-[9px] text-gray-400 mt-1 block">
                {new Date(inc.timestamp?.seconds * 1000).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
