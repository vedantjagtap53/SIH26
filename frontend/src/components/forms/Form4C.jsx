import React, { useState } from 'react';
import { Send, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function Form4C({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({
    returningWorkers: []
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addWorker = () => {
    setFormData({
      ...formData,
      returningWorkers: [...formData.returningWorkers, { name: '', returnDate: '', sameJob: 'Yes', compensation: '' }]
    });
  };

  const removeWorker = (index) => {
    const updated = [...formData.returningWorkers];
    updated.splice(index, 1);
    setFormData({ ...formData, returningWorkers: updated });
  };

  const handleWorkerChange = (index, field, value) => {
    const updated = [...formData.returningWorkers];
    updated[index][field] = value;
    setFormData({ ...formData, returningWorkers: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form4C', formData);
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
        Form 4-C: Particulars of injured person(s) returning to duty<br/>
        (Within 15 days of return to duty)
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
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3. Mine Code (nnnnnn)</label>
            <input required type="text" name="mineCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">5. Date of accident</label>
            <input required type="date" name="accidentDate" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* Returning Workers List */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-sm text-gray-800">Returning Workers Details</h3>
          <button type="button" onClick={addWorker} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-indigo-100">
            <Plus size={14} /> Add Worker
          </button>
        </div>
        
        {formData.returningWorkers.map((v, i) => (
          <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative">
            <button type="button" onClick={() => removeWorker(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Name</label>
                <input required type="text" value={v.name} onChange={e => handleWorkerChange(i, 'name', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Return Date</label>
                <input required type="date" value={v.returnDate} onChange={e => handleWorkerChange(i, 'returnDate', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Same Job?</label>
                <select required value={v.sameJob} onChange={e => handleWorkerChange(i, 'sameJob', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs">
                  <option value="Yes">Yes</option>
                  <option value="No">No (Other Job)</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Statutory Compensation Paid (Rs)</label>
                <input type="number" min="0" value={v.compensation} onChange={e => handleWorkerChange(i, 'compensation', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
            </div>
          </div>
        ))}
        {formData.returningWorkers.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4">No returning workers added.</div>
        )}
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 4-C
      </button>
    </form>
  );
}
