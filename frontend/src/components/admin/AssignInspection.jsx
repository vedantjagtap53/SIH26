import React, { useState, useEffect } from 'react';
import BentoCard from '../BentoCard';
import { ClipboardCheck, Send } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import mlData from '../../data/ml_predictions.json';

export default function AssignInspection({ allUsers = [], preSelectedMine = null, preSelectedIncident = null, setActiveTab }) {
  const [selectedMine, setSelectedMine] = useState(preSelectedMine);
  const [form, setForm] = useState({
    inspectorUid: '',
    dueDate: '',
    priority: 'HIGH',
    template: 'Open Cast (OC) Statutory Audit (Star Rating Standard)',
    notes: ''
  });
  const [status, setStatus] = useState('');

  // Update selected mine if preSelectedMine changes (from map click)
  useEffect(() => {
    if (preSelectedMine) setSelectedMine(preSelectedMine);
  }, [preSelectedMine]);

useEffect(() => {
    if (preSelectedIncident) {
      setForm(prev => ({
        ...prev,
        notes: `Investigate Hazard: ${preSelectedIncident.hazardType}\nLocation: ${preSelectedIncident.location}\nReported by: ${preSelectedIncident.reporterName}\nDetails: ${preSelectedIncident.description}`
      }));
    }
  }, [preSelectedIncident]);

  const inspectors = allUsers.filter(u => u.role === 'inspector' && u.approved === true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMine || !form.inspectorUid) return;

    const assignedInspector = inspectors.find(ins => ins.id === form.inspectorUid);
    
    try {
      await addDoc(collection(db, 'assignments'), {
        mineId: selectedMine.id,
        mineName: selectedMine.mine_name || selectedMine.name,
        company: selectedMine.company || '',
        riskScore2526: selectedMine.score_2526 || 0,
        riskScore2627: selectedMine.score_2627 || 0,
        inspectorUid: form.inspectorUid,
        inspectorName: assignedInspector?.fullName || assignedInspector?.email,
        inspectorEmail: assignedInspector?.email,
        dueDate: form.dueDate,
        priority: form.priority,
        template: form.template,
        notes: form.notes,
        status: 'PENDING',
        timestamp: serverTimestamp()
      });
      setStatus('Inspection order dispatched successfully!');
      setTimeout(() => {
        setSelectedMine(null);
        setStatus('');
        if(setActiveTab) setActiveTab('tracker');
      }, 1200);
    } catch (err) {
      console.error(err);
      setStatus('Failed to assign inspection.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <BentoCard 
        title={selectedMine ? `Assign Inspection: ${selectedMine.mine_name || selectedMine.name}` : "Create Risk-Based Inspection Assignment"} 
        icon={<ClipboardCheck size={20} />}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedMine ? (
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-gray-900">{selectedMine.mine_name || selectedMine.name} (ID: {selectedMine.id})</div>
                <div className="text-xs text-red-600 font-semibold mt-0.5">
                  AI Forecast Score (26-27): {selectedMine.score_2627 ? selectedMine.score_2627.toFixed(1) : (selectedMine.risk_score * 100).toFixed(0)}
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setSelectedMine(null)}
                className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
              >
                Change Mine
              </button>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Target Mine (from AI Forecast)</label>
              <select
                onChange={e => {
                  const m = mlData.find(x => x.id === e.target.value);
                  setSelectedMine(m || mlData[0]);
                }}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
              >
                <option value="">-- Choose High-Risk Mine --</option>
                {mlData.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.mine_name} (AI Forecast: {m.score_2627.toFixed(1)})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Select Statutory Inspector</label>
              <select
                value={form.inspectorUid}
                onChange={e => setForm({ ...form, inspectorUid: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
                required
              >
                <option value="">-- Select Active Inspector --</option>
                {inspectors.map(ins => (
                  <option key={ins.id} value={ins.id}>
                    {ins.fullName || ins.email}
                  </option>
                ))}
              </select>
              {inspectors.length === 0 && (
                <p className="text-[10px] text-red-500 mt-1">No active inspectors found. Please approve one in Join Requests.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Inspection Due Date</label>
              <input
                type="date"
                required
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Priority Level</label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-bold cursor-pointer"
              >
                <option value="CRITICAL">CRITICAL (Within 24 Hours)</option>
                <option value="HIGH">HIGH (Within 3 Days)</option>
                <option value="MEDIUM">MEDIUM (Scheduled Statutory)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Audit Template Checklist</label>
              <select
                value={form.template}
                onChange={e => setForm({ ...form, template: e.target.value })}
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
              >
                <option value="Open Cast (OC) Statutory Audit (Star Rating Standard)">Official DGMS Template: Open Cast (OC) Statutory Audit</option>
                <option value="Underground (UG) Statutory Audit (Star Rating Standard)">Official DGMS Template: Underground (UG) Statutory Audit</option>
                <option value="DGMS DG-102 (Gas & Ventilation)">DGMS DG-102 (Gas & Ventilation Checklist)</option>
                <option value="DGMS Strata & Roof Control Plan">DGMS Strata & Roof Control Plan (RCP)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Special Directives</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              placeholder="Specific gallery numbers, telltale readings, or hazard instructions..."
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {status && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl">
              {status}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!selectedMine || !form.inspectorUid}
              className={`flex-1 font-bold py-3 rounded-xl shadow-lg text-xs transition-all flex items-center justify-center gap-2 ${
                selectedMine && form.inspectorUid 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} /> Dispatch Inspection Assignment Order
            </button>
            {selectedMine && (
              <button
                type="button"
                onClick={() => setSelectedMine(null)}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </BentoCard>
    </div>
  );
}
