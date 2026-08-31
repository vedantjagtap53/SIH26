import React, { useState } from 'react';
import BentoCard from '../BentoCard';
import { Megaphone, Send } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Broadcasts({ broadcasts }) {
  const [form, setForm] = useState({ title: '', message: '', targetAudience: 'ALL' });
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    try {
      await addDoc(collection(db, 'broadcasts'), {
        ...form,
        timestamp: serverTimestamp(),
        sender: 'Admin Headquarters'
      });
      setStatus('Broadcast sent successfully!');
      setForm({ title: '', message: '', targetAudience: 'ALL' });
      setTimeout(() => setStatus(''), 2000);
    } catch (err) {
      console.error(err);
      setStatus('Failed to send broadcast.');
    }
  };

  return (
    <div className="space-y-6">
      <BentoCard title="Send Emergency or General Broadcast" icon={<Megaphone size={20} />}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Target Audience</label>
            <select
              value={form.targetAudience}
              onChange={e => setForm({ ...form, targetAudience: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Personnel (Inspectors & Workers)</option>
              <option value="INSPECTORS">Statutory Inspectors Only</option>
              <option value="WORKERS">Field Workers Only</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Weather Alert, Policy Update"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Message Body</label>
            <textarea
              required
              rows={3}
              placeholder="Detailed message..."
              value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          {status && <div className="text-xs font-bold text-emerald-600">{status}</div>}
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2">
            <Send size={16} /> Broadcast Message
          </button>
        </form>
      </BentoCard>

      <BentoCard title="Recent Broadcasts" icon={<Megaphone size={20} />}>
        <div className="space-y-3">
          {broadcasts.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No recent broadcasts.</p>
          ) : broadcasts.map(b => (
            <div key={b.id} className="p-3 border border-gray-100 rounded-xl bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-900">{b.title}</span>
                <span className="text-[10px] text-gray-500">{new Date(b.timestamp ? b.timestamp.toMillis() : Date.now()).toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-600">{b.message}</p>
              <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded w-fit uppercase">
                To: {b.targetAudience}
              </div>
            </div>
          ))}
        </div>
      </BentoCard>
    </div>
  );
}
