import React from 'react';
import BentoCard from '../BentoCard';
import { FileText, CheckCircle2 } from 'lucide-react';

export default function StatutoryArchive({ forms }) {
  return (
    <BentoCard title="Statutory Forms Archive (Ministry Records)" icon={<FileText size={20} />}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {forms.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-xs text-gray-500 font-medium">No statutory forms submitted yet.</div>
        ) : forms.map(form => (
          <div key={form.id} className="p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-indigo-100 text-indigo-700">
                  {form.formType}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {form.timestamp ? new Date(form.timestamp.seconds * 1000).toLocaleTimeString() : 'Just now'}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">{form.mineName || form.contractorName || form.nameOfMine || 'Statutory Filing'}</h3>
              
              <div className="bg-slate-50 p-2.5 rounded-lg text-[10px] text-gray-500 mb-4 grid grid-cols-1 gap-1">
                {Object.entries(form).map(([key, value]) => {
                  if (['formType', 'submittedBy', 'timestamp', 'id', 'submittedByName', 'submittedByRole'].includes(key)) return null;
                  return (
                    <div key={key} className="truncate"><span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {String(value)}</div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
              <span className="text-[10px] font-semibold text-gray-500">
                Submitted by: {form.submittedByName} ({form.submittedByRole})
              </span>
              <CheckCircle2 size={16} className="text-emerald-500" />
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
