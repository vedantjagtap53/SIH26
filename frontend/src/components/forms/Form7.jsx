import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Form7({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form7', formData);
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
        Form 7: Manager’s Charge Report<br/>
        (See Regulation 28)
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
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Name of Mine</label>
            <input required type="text" name="mineName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Mine Code (nnnnnn)</label>
            <input required type="text" name="mineCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Outgoing Manager</label>
            <input required type="text" name="outgoingManager" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Incoming Manager</label>
            <input required type="text" name="incomingManager" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">3.0 Sources of Danger</h3>
        
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3.1 Mine Gases (Problems & Precautions)</label>
          <textarea required rows={2} name="dangerGases" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3.2 Fires and Spontaneous Heating</label>
          <textarea required rows={2} name="dangerFires" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3.5 Sources of Water / Inundation</label>
          <textarea required rows={2} name="dangerWater" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Compliance & Safety Status</h3>
        
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">4.0 Status of Safety Management Plan (SMP)</label>
          <textarea required rows={2} name="statusSMP" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">11.0 Important safety works requiring attention</label>
          <textarea required rows={2} name="safetyWorks" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">13.0 Other matters to be attended by incoming manager</label>
          <textarea required rows={2} name="otherMatters" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 7
      </button>
    </form>
  );
}
