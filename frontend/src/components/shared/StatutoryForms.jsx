import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  FileText, Activity, AlertTriangle, FileWarning, 
  Stethoscope, UserX, Briefcase
} from 'lucide-react';

import Form4A from '../forms/Form4A';
import Form4B from '../forms/Form4B';
import Form4C from '../forms/Form4C';
import Form5 from '../forms/Form5';
import Form6 from '../forms/Form6';
import Form7 from '../forms/Form7';

export default function StatutoryForms({ userDocData }) {
  const [activeForm, setActiveForm] = useState(null);
  const role = userDocData?.role;
  const [submitStatus, setSubmitStatus] = useState(null);

  const isAdmin = userDocData?.role === 'manager';
  const isInspector = userDocData?.role === 'inspector';

  const submitFormToDb = async (formType, data) => {
    try {
      await addDoc(collection(db, 'statutory_forms'), {
        formType,
        ...data,
        submittedBy: userDocData?.uid || 'unknown_uid',
        submittedByName: userDocData?.fullName || userDocData?.name || 'Unknown',
        submittedByRole: userDocData?.role || 'Unknown',
        timestamp: serverTimestamp()
      });
      setSubmitStatus(`Successfully submitted ${formType} to DGMS records.`);
      setTimeout(() => {
        setSubmitStatus(null);
        setActiveForm(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit form. Please try again.');
    }
  };

  const formList = [
    {
      id: '4a',
      title: 'Form 4-A: Notice of Accident/Dangerous Occurrence',
      description: 'Report serious accidents or dangerous occurrences as per Reg 8.',
      icon: <AlertTriangle size={24} className="text-red-500" />,
      allowed: isAdmin,
      component: <Form4A userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    },
    {
      id: '4b',
      title: 'Form 4-B: Particulars of deceased / injured persons',
      description: 'Submit within 7 days of occurrence for all affected workers.',
      icon: <UserX size={24} className="text-orange-500" />,
      allowed: isAdmin,
      component: <Form4B userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    },
    {
      id: '4c',
      title: 'Form 4-C: Particulars of injured persons returning to duty',
      description: 'Submit within 15 days of injured worker returning to duty.',
      icon: <Activity size={24} className="text-green-500" />,
      allowed: isAdmin,
      component: <Form4C userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    },
    {
      id: '5',
      title: 'Form 5: Notice of disease (Sec 25)',
      description: 'Notify DGMS of any occupational disease contracted by a worker.',
      icon: <Stethoscope size={24} className="text-teal-500" />,
      allowed: isAdmin,
      component: <Form5 userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    },
    {
      id: '6',
      title: 'Form 6: Pointing out of contraventions',
      description: 'Record of contraventions observed during mine inspection.',
      icon: <FileWarning size={24} className="text-red-600" />,
      allowed: isInspector || isAdmin, // Allow manager to see/test for now
      component: <Form6 userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    },
    {
      id: '7',
      title: 'Form 7: Manager’s charge report',
      description: 'Report submitted when handing over charge to incoming manager.',
      icon: <Briefcase size={24} className="text-blue-500" />,
      allowed: isAdmin,
      component: <Form7 userDocData={userDocData} onSubmit={submitFormToDb} onCancel={() => setActiveForm(null)} status={submitStatus} />
    }
  ];

  const renderFormList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {formList.filter(f => f.allowed).map((form) => (
        <div 
          key={form.id} 
          onClick={() => setActiveForm(form.id)}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group flex flex-col items-start gap-4"
        >
          <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-indigo-50 transition-colors">
            {form.icon}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 mb-2">{form.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{form.description}</p>
          </div>
          <div className="mt-auto pt-4 w-full border-t border-slate-100 flex justify-between items-center text-xs font-bold text-indigo-600">
            <span>Fill Form</span>
            <span>&rarr;</span>
          </div>
        </div>
      ))}
      
      {formList.filter(f => f.allowed).length === 0 && (
        <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 border-dashed">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No statutory forms are currently assigned to your role.</p>
        </div>
      )}
    </div>
  );

  const activeFormComponent = formList.find(f => f.id === activeForm)?.component;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Statutory Forms (DGMS)</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Digital filing for official mining compliances.</p>
        </div>
      </div>

      {activeForm ? activeFormComponent : renderFormList()}
    </div>
  );
}
