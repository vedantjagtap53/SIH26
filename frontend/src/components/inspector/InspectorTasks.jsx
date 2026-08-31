import React from 'react';
import BentoCard from '../BentoCard';
import { ClipboardCheck, Play } from 'lucide-react';

export default function InspectorTasks({ assignments, onStartAudit }) {
  const pendingTasks = assignments.filter(a => a.status === 'PENDING' || a.status === 'IN_PROGRESS');

  return (
    <BentoCard title="My Dispatched Field Inspections" icon={<ClipboardCheck size={20} />}>
      <div className="space-y-4">
        {pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500 font-medium">No pending tasks. You are all caught up!</div>
        ) : pendingTasks.map(task => (
          <div key={task.id} className="border border-indigo-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 text-sm">{task.mineName}</h3>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  task.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : 
                  task.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {task.priority}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono mb-2">Mine ID: {task.mineId} • Due: {task.dueDate}</p>
              
              <div className="bg-slate-50 p-2.5 rounded-lg border border-gray-100 mt-2">
                <p className="text-[10px] font-bold text-gray-600 mb-1">AUDIT DIRECTIVE:</p>
                <p className="text-[11px] text-gray-800 font-medium">{task.notes}</p>
                <div className="mt-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded w-fit">
                  TEMPLATE: {task.template}
                </div>
              </div>
            </div>
            
            <div className="shrink-0">
              <button 
                onClick={() => onStartAudit(task)}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-sm text-xs transition-colors flex items-center justify-center gap-2"
              >
                <Play size={14} /> Start Audit Execution
              </button>
            </div>
          </div>
        ))}
      </div>
    </BentoCard>
  );
}
