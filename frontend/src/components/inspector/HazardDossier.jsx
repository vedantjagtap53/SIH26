import React from 'react';
import BentoCard from '../BentoCard';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function HazardDossier({ incidents }) {
  // Let Inspectors see all unresolved incidents so they know what to check
  const unresolvedIncidents = incidents.filter(i => i.status !== 'RESOLVED');

  const getPriorityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-700';
      case 'HIGH': return 'bg-amber-100 text-amber-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <BentoCard title="Area Hazard Dossier (Worker Reported)" icon={<ShieldAlert size={20} />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {unresolvedIncidents.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-xs text-emerald-600 font-bold">
            <CheckCircle2 size={32} className="mx-auto mb-2" />
            No active hazards reported by workforce in your jurisdiction.
          </div>
        ) : unresolvedIncidents.map(inc => (
          <div key={inc.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-sm ${getPriorityColor(inc.severity)}`}>
                  {inc.severity} RISK
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {new Date(inc.timestamp?.seconds * 1000).toLocaleTimeString()}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{inc.hazardType}</h3>
              {inc.photoBase64 && (
                <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                  <img src={inc.photoBase64} alt="Hazard Evidence" className="w-full h-32 object-cover" />
                </div>
              )}

              <p className="text-xs text-gray-600 mb-3">{inc.description}</p>
              
              <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-gray-500 mb-4 grid grid-cols-2 gap-2">
                <div><span className="font-bold">Location:</span> {inc.location}</div>
                <div><span className="font-bold">Reported By:</span> {inc.reporterName || 'Anonymous'}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
