import React, { useState } from 'react';
import BentoCard from '../BentoCard';
import { Calendar, Send } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function WorkerLeaves({ userDocData, leaves }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'leave_requests'), {
        ...form,
        workerUid: userDocData.uid,
        workerName: userDocData.fullName || userDocData.email,
        workerEmail: userDocData.email,
        role: userDocData.role || 'worker',
        status: 'PENDING',
        timestamp: serverTimestamp()
      });
      setStatus('Leave request submitted!');
      setForm({ startDate: '', endDate: '', reason: '' });
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('Error submitting request.');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <BentoCard title="Apply for Leave" icon={<Calendar size={20} />}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Start Date</label>
            <input required type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">End Date</label>
            <input required type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Reason</label>
            <textarea required rows={2} value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500" />
          </div>
          {status && <div className="text-xs font-bold text-indigo-600">{status}</div>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2">
            <Send size={16} /> Submit Request
          </button>
        </form>
      </BentoCard>

      <BentoCard title="My Leave History" icon={<Calendar size={20} />}>
        <div className="space-y-3">
          {leaves.length === 0 ? (
            <p className="text-center py-8 text-xs text-gray-500">No past leave requests.</p>
          ) : leaves.map(lr => (
            <div key={lr.id} className="p-3 border border-gray-100 rounded-xl bg-white flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-gray-800">{lr.startDate} <span className="text-gray-400 font-normal mx-1">to</span> {lr.endDate}</p>
                <p className="text-[10px] text-gray-500 mt-1 max-w-[150px] truncate">{lr.reason}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${lr.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : lr.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {lr.status}
              </span>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
}
