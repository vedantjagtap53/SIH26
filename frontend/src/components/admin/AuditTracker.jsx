import React from 'react';
import BentoCard from '../BentoCard';
import { ClipboardCheck } from 'lucide-react';

export default function AuditTracker({ assignments }) {
  return (
    <BentoCard title="Live Statutory Inspection Tracker" icon={<ClipboardCheck size={20} />}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
              <th className="py-3 px-3">Date Dispatched</th>
              <th className="py-3 px-3">Target Mine & Sector</th>
              <th className="py-3 px-3">Assigned Inspector</th>
              <th className="py-3 px-3">Audit Scope</th>
              <th className="py-3 px-3 text-right">Live Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 font-medium">No inspection orders dispatched yet.</td>
              </tr>
            ) : assignments.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3.5 px-3">
                  <div className="font-bold text-gray-800">{new Date(a.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString('en-GB')}</div>
                  <div className="text-[10px] text-gray-500">Due: {a.dueDate || 'N/A'}</div>
                </td>
                <td className="py-3.5 px-3 font-bold text-gray-900">{a.mineName}</td>
                <td className="py-3.5 px-3">
                  <div className="font-bold text-gray-800">{a.inspectorName || a.inspectorEmail}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{a.inspectorUid}</div>
                </td>
                <td className="py-3.5 px-3 text-gray-600 font-medium">{a.template || a.hazardType}</td>
                <td className="py-3.5 px-3 text-right">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                    a.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-700' :
                    a.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                    a.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BentoCard>
  );
}
