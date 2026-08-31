import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function Form4A({ userDocData, onSubmit, onCancel, status }) {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit('Form4A', formData);
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
        Form 4-A: Notice of Accident/Dangerous Occurrence<br/>
        (See Regulation 8)
      </div>

      {status && (
        <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          {status}
        </div>
      )}

      {/* 1-4. Basic Info */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">1. Name of Mine</label>
            <input required type="text" name="mineName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">2. Name of Owner</label>
            <input required type="text" name="ownerName" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">3. Mine Code (nnnnnn)</label>
            <input required type="text" name="mineCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">4. Labour Id Number (LIN)</label>
            <input required type="text" name="lin" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">5. Date of Accident</label>
            <input required type="date" name="accidentDate" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">6. Time of Accident</label>
            <input required type="time" name="accidentTime" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* 7 & 8. Addresses */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">Location & Address Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">7.1 Mineral</label>
            <input required type="text" name="mineral" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">7.5 District</label>
            <input required type="text" name="district" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">7.6 State</label>
            <input required type="text" name="state" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">8.10 Phone Number</label>
            <input required type="text" name="phone" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* 9. Particulars of Accident */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-gray-800 border-b pb-2">9. Particulars of the Accident</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.1 Shift Name/No</label>
            <input required type="text" name="shift" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.2 Cause Code (0111 to 0999)</label>
            <select required name="causeCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500">
              <option value="">Select Cause...</option>
              <option value="0111">0111 Fall of Roof</option>
              <option value="0112">0112 Fall of Sides</option>
              <option value="0334">0334 Conveyors</option>
              <option value="0335">0335 Dumpers</option>
              <option value="0500">0500 Explosives</option>
              <option value="0600">0600 Electricity</option>
              <option value="0775">0775 Spontaneous Heating</option>
              <option value="0999">0999 Other than above</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.3 Place Code</label>
            <select required name="placeCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500">
              <option value="">Select Place...</option>
              <option value="1">1 Below ground</option>
              <option value="2">2 Opencast</option>
              <option value="3">3 Above ground</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.4 Workings Code</label>
            <select required name="workingsCode" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500">
              <option value="">Select Working...</option>
              <option value="1">1 Development</option>
              <option value="2">2 Longwall</option>
              <option value="3">3 Depillaring</option>
              <option value="4">4 Coal bench</option>
              <option value="5">5 O/B Bench</option>
              <option value="9">9 Others</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.5 Persons Killed</label>
            <input required type="number" min="0" name="killedCount" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">9.6 Persons Seriously Injured</label>
            <input required type="number" min="0" name="injuredCount" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-bold uppercase text-gray-600 mb-1">11. Brief Description</label>
            <textarea required rows={3} name="description" onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:border-indigo-500"></textarea>
          </div>
        </div>
      </div>

      <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer">
        <Send size={16} /> Submit Form 4-A
      </button>
    </form>
  );
}
