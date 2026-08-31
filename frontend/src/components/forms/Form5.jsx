import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Form5({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form5', formData);
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
        Form 5: Notice of disease notified under section 25 of the Mines Act<br/>
        (See Regulation 9)
      </div>

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {status}
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Mine & Patient Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">1. Name of Mine</label>
            <input required type="text" name="mineName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">2.1 Mine Code</label>
            <input required type="text" name="mineCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="col-span-2 border-t pt-4 mt-2">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6.1 Name of affected person</label>
            <input required type="text" name="patientName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6.4 Aadhaar Number</label>
            <input type="text" name="aadhaar" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6.6 Sex</label>
            <select name="sex" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500">
              <option value="">Select...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6.8 Age</label>
            <input required type="number" min="0" name="age" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6.11(b) Total Employment in Mining (Years)</label>
            <input required type="number" min="0" step="0.1" name="experience" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Disease Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">7.1 Nature of Disease</label>
            <select required name="diseaseName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500">
              <option value="">Select Disease...</option>
              <option value="Pneumoconiosis">Pneumoconiosis</option>
              <option value="Silicosis">Silicosis</option>
              <option value="Asbestosis">Asbestosis</option>
              <option value="Noise Induced Hearing Loss">Noise Induced Hearing Loss</option>
              <option value="Other">Other Occupational Disease</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">7.2 Date of Detection</label>
            <input required type="date" name="detectionDate" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">8(i). Name of Medical Practitioner</label>
            <input required type="text" name="docName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 5
      </button>
    </form>
  );
}
