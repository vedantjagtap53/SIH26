import React, { useState } from 'react';
import { Send, CheckCircle2, Plus, Trash2 } from 'lucide-react';

export default function Form4B({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({
    victims: []
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addVictim = () => {
    setFormData({
      ...formData,
      victims: [...formData.victims, { name: '', injuryCode: '', bodyPartCode: '', status: 'Injured' }]
    });
  };

  const removeVictim = (index) => {
    const updated = [...formData.victims];
    updated.splice(index, 1);
    setFormData({ ...formData, victims: updated });
  };

  const handleVictimChange = (index, field, value) => {
    const updated = [...formData.victims];
    updated[index][field] = value;
    setFormData({ ...formData, victims: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form4B', formData);
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
        Form 4-B: Particulars of deceased / injured person(s)<br/>
        (To be submitted within 7 days of occurrence)
      </div>

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {status}
        </div>
      )}

      {/* Basic Info */}
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
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3. Date of accident</label>
            <input required type="date" name="accidentDate" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">4. Time of Accident</label>
            <input required type="time" name="accidentTime" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* Victims List */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="font-bold text-sm text-gray-800">9. Details of deceased workers / injured</h3>
          <button type="button" onClick={addVictim} className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer hover:bg-indigo-100">
            <Plus size={14} /> Add Victim
          </button>
        </div>
        
        {formData.victims.map((v, i) => (
          <div key={i} className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 relative">
            <button type="button" onClick={() => removeVictim(i)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 cursor-pointer">
              <Trash2 size={16} />
            </button>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Name</label>
                <input required type="text" value={v.name} onChange={e => handleVictimChange(i, 'name', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Status</label>
                <select required value={v.status} onChange={e => handleVictimChange(i, 'status', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs">
                  <option value="Injured">Injured</option>
                  <option value="Killed">Killed</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Injury Code</label>
                <select value={v.injuryCode} onChange={e => handleVictimChange(i, 'injuryCode', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs">
                  <option value="">Select...</option>
                  <option value="1">1-Amputation</option>
                  <option value="2">2-Fracture</option>
                  <option value="3">3-Internal</option>
                  <option value="4">4-Burn</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Body Part</label>
                <select value={v.bodyPartCode} onChange={e => handleVictimChange(i, 'bodyPartCode', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs">
                  <option value="">Select...</option>
                  <option value="10">10-Head</option>
                  <option value="12">12-Eye</option>
                  <option value="32">32-Chest</option>
                  <option value="40">40-Upper limb</option>
                  <option value="50">50-Lower limbs</option>
                </select>
              </div>
              <div className="col-span-3">
                <label className="block text-[10px] font-bold uppercase text-gray-600 mb-1">Job being done at time of accident</label>
                <input type="text" value={v.job} onChange={e => handleVictimChange(i, 'job', e.target.value)} className="w-full bg-white border border-gray-200 rounded p-1.5 text-xs" />
              </div>
            </div>
          </div>
        ))}
        {formData.victims.length === 0 && (
          <div className="text-center text-xs text-gray-500 py-4">No victims added. Click "Add Victim" to input details.</div>
        )}
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <label className="block text-xs font-bold uppercase text-gray-600 mb-1">12. Action taken to prevent similar accident?</label>
        <textarea required rows={3} name="actionTaken" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 4-B
      </button>
    </form>
  );
}
