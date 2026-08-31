import React from 'react';
import BentoCard from '../BentoCard';
import { Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function LeaveApprovals({ leaveRequests, scope = 'local' }) {
  const handleAction = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, 'leave_requests', id), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const scopeFilteredLeaves = leaveRequests.filter(lr => {
    if (scope === 'national') return lr.role === 'manager' || lr.role === 'inspector';
    return lr.role === 'worker';
  });

  const pendingLeaves = scopeFilteredLeaves.filter(lr => lr.status === 'PENDING');
  const pastLeaves = scopeFilteredLeaves.filter(lr => lr.status !== 'PENDING');

  return (
    <div className="space-y-6">
      <BentoCard title="Pending Worker Leave Requests" icon={<Calendar size={20} />}>
        {pendingLeaves.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-500 font-medium">No pending leave requests.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingLeaves.map(lr => (
              <div key={lr.id} className="border border-indigo-100 rounded-2xl p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">{lr.workerName || 'Worker'}</h3>
                    <p className="text-[11px] text-gray-500 font-mono mt-0.5">{lr.workerEmail}</p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    Pending
                  </span>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 text-[11px] mb-4 border border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dates:</span>
                    <span className="font-bold text-gray-800">{lr.startDate} to {lr.endDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason:</span>
                    <span className="font-medium text-gray-800 text-right max-w-[150px]">{lr.reason}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleAction(lr.id, 'APPROVED')}
                    className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button 
                    onClick={() => handleAction(lr.id, 'REJECTED')}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </BentoCard>

      <BentoCard title="Past Leave Actions" icon={<Calendar size={20} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="py-3 px-3">Worker</th>
                <th className="py-3 px-3">Dates</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {pastLeaves.map(lr => (
                <tr key={lr.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold">{lr.workerName}</td>
                  <td className="py-3 px-3 text-gray-600">{lr.startDate} to {lr.endDate}</td>
                  <td className="py-3 px-3 text-right">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      lr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {lr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}
