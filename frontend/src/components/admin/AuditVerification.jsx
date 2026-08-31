import React, { useState } from 'react';
import BentoCard from '../BentoCard';
import { ClipboardCheck, CheckCircle2, ShieldAlert, FileText, CheckCircle } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function AuditVerification({ inspections, assignments }) {
  const [selectedAudit, setSelectedAudit] = useState(null);
  const [isVerifying, setIsVerifying] = useState(null);

  const handleVerify = async (auditId, assignmentId) => {
    setIsVerifying(auditId);
    try {
      await updateDoc(doc(db, 'inspections', auditId), { status: 'VERIFIED' });
      if (assignmentId) {
        await updateDoc(doc(db, 'assignments', assignmentId), { status: 'VERIFIED' });
      }
      setSelectedAudit(null);
    } catch (e) {
      console.error('Error verifying audit:', e);
    } finally {
      setIsVerifying(null);
    }
  };

  const pendingAudits = (inspections || []).filter(i => i.status !== 'VERIFIED');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <BentoCard title="Pending Field Audits Awaiting Verification" icon={<CheckCircle2 size={20} className="text-indigo-600" />}>
        {pendingAudits.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-500 font-medium">
            <CheckCircle size={32} className="mx-auto mb-2 text-emerald-400 opacity-60" />
            No pending audits to verify. All field submissions are up-to-date!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pendingAudits.map(audit => {
              const auditKeys = Object.entries(audit).filter(([key]) => 
                !['id', 'assignmentId', 'inspectorUid', 'inspectorName', 'mineId', 'mineName', 'status', 'timestamp', 'template', 'remarks', 'safeSystem', 'auditCategory'].includes(key)
              );

              return (
                <div key={audit.id} className="border border-indigo-100 rounded-2xl p-4 bg-white shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {audit.auditCategory || audit.template || 'Statutory Inspection'}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm mt-1">{audit.mineName || 'Unknown Mine'}</h3>
                        <p className="text-[11px] text-gray-500 mt-0.5">Submitted by: <span className="font-semibold text-slate-700">{audit.inspectorName || 'Inspector'}</span></p>
                      </div>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Needs Review
                      </span>
                    </div>

                    {/* Core System Status */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl mb-3 border border-slate-100 text-xs">
                      <span className="font-bold text-slate-600">Safe System of Work:</span>
                      <span className={`font-black px-2 py-0.5 rounded text-[10px] ${
                        audit.safeSystem === 'Yes' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {audit.safeSystem === 'Yes' ? 'COMPLIANT (YES)' : 'VIOLATIONS OBSERVED'}
                      </span>
                    </div>
                    
                    {/* Live Geotagged Photo Evidence */}
                    {audit.photoEvidence && (
                      <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 bg-black relative group">
                        <img src={audit.photoEvidence} alt="Inspection Proof" className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-mono px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          LIVE CAM EVIDENCE {audit.location ? `• GPS: ${Number(audit.location.latitude ?? audit.location.lat ?? 0).toFixed(4)}, ${Number(audit.location.longitude ?? audit.location.lng ?? 0).toFixed(4)}` : ''}
                        </div>
                      </div>
                    )}

                    {/* Dynamic Official Parameters Evaluated */}
                    <div className="bg-slate-50/70 rounded-xl p-3 text-[11px] mb-4 border border-gray-100 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 border-b pb-1">Evaluated Parameters</p>
                      {auditKeys.length === 0 ? (
                        <p className="text-gray-400 italic text-[10px]">Standard parameters checked.</p>
                      ) : (
                        auditKeys.map(([key, value]) => {
                          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                          const isWarning = String(value).toLowerCase().includes('danger') || 
                                            String(value).toLowerCase().includes('hazard') || 
                                            String(value).toLowerCase().includes('deficit') ||
                                            String(value).toLowerCase().includes('unstable') ||
                                            String(value).toLowerCase().includes('non-compliant');

                          return (
                            <div key={key} className="flex justify-between items-center text-xs py-0.5 border-b border-gray-100/50 last:border-0">
                              <span className="text-slate-500 font-medium truncate max-w-[50%]">{formattedKey}:</span>
                              <span className={`font-semibold text-right text-[11px] ${isWarning ? 'text-rose-600' : 'text-slate-800'}`}>
                                {String(value)}
                              </span>
                            </div>
                          );
                        })
                      )}

                      {audit.remarks && (
                        <div className="pt-2 mt-2 border-t border-gray-200/60">
                          <span className="text-slate-400 text-[10px] font-bold block mb-0.5 uppercase">Inspector Directives / Remarks:</span>
                          <p className="font-medium text-slate-700 text-xs italic bg-white p-2 rounded-lg border border-gray-100">"{audit.remarks}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleVerify(audit.id, audit.assignmentId)}
                    disabled={isVerifying === audit.id}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <CheckCircle2 size={15} /> {isVerifying === audit.id ? 'Verifying...' : 'Verify & Close Official Audit'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </BentoCard>
    </div>
  );
}
