import React, { useState } from 'react';
import { Send, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function Form6({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({
    contraventions: []
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addContravention = () => {
    setFormData({
      ...formData,
      contraventions: [...formData.contraventions, { place: '', rule: '', observation: '', action: '', rectDate: '' }]
    });
  };

  const removeContravention = (index) => {
    const updated = [...formData.contraventions];
    updated.splice(index, 1);
    setFormData({ ...formData, contraventions: updated });
  };

  const handleChange = (index, field, value) => {
    const updated = [...formData.contraventions];
    updated[index][field] = value;
    setFormData({ ...formData, contraventions: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form6', formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div className="flex justify-between items-center mb-6">
        <button type="button" onClick={onCancel} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer">
          &larr; Back to Forms List
        </button>
      </div>

      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 text-xs font-mono text-slate-600 text-center">
        <strong>DIRECTORATE GENERAL OF MINES SAFETY</strong><br/>
        Form 6: Pointing out of contraventions during Inspections<br/>
        (See Regulation 117)
      </div>

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {status}
        </div>
      )}

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">1. Name of Mine</label>
            <input required type="text" name="mineName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">2. Mine Code (nnnnnn)</label>
            <input required type="text" name="mineCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9. Inspected by (Name)</label>
            <input required type="text" name="inspectorName" onChange={handleInputChange} defaultValue={userDocData?.name || ''} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">11. Date of Inspection</label>
            <input required type="date" name="inspectionDate" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* Contraventions List */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-sm text-gray-800">Contraventions Table</h3>
          <button type="button" onClick={addContravention} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-indigo-100">
            <Plus size={14} /> Add Issue
          </button>
        </div>
        
        {formData.contraventions.map((v, i) => (
          <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative">
            <button type="button" onClick={() => removeContravention(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">1. Places Inspected</label>
                <input required type="text" value={v.place} onChange={e => handleChange(i, 'place', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">2. Regulation/Rule Contravened</label>
                <input required type="text" value={v.rule} onChange={e => handleChange(i, 'rule', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div className="col-span-4">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">3. Contravention Observed</label>
                <textarea required value={v.observation} onChange={e => handleChange(i, 'observation', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs"></textarea>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">4. Action Required</label>
                <input type="text" value={v.action} onChange={e => handleChange(i, 'action', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">5. Deadline for Rectification</label>
                <input type="date" value={v.rectDate} onChange={e => handleChange(i, 'rectDate', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
            </div>
          </div>
        ))}
        {formData.contraventions.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4">No issues added.</div>
        )}
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 6
      </button>
    </form>
  );
}
