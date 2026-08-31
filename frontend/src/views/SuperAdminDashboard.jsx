import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { 
  Briefcase, Users, AlertTriangle, FileText, 
  Search, ShieldAlert, CheckCircle2, XCircle, ChevronRight, Activity, Globe, Shield
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import IncidentDesk from '../components/admin/IncidentDesk';
import Broadcasts from '../components/admin/Broadcasts';
import LeaveApprovals from '../components/admin/LeaveApprovals';
import StatutoryArchive from '../components/admin/StatutoryArchive';
import AuditTracker from '../components/admin/AuditTracker';
import AssignInspection from '../components/admin/AssignInspection';

import JoinRequests from '../components/admin/JoinRequests';
import AdminOverview from '../components/admin/AdminOverview';
import AdminAttendanceLogs from '../components/admin/AdminAttendanceLogs';
import mlData from '../data/ml_predictions.json';

export default function SuperAdminDashboard({ userDocData }) {
  const [activeTab, setActiveTab] = useState('national_overview');

  const [allUsers, setAllUsers] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [forms, setForms] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [selectedMineForAssign, setSelectedMineForAssign] = useState(null);
  const [selectedIncidentForAssign, setSelectedIncidentForAssign] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    
    const unsubLeaves = onSnapshot(query(collection(db, 'leave_requests'), orderBy('timestamp', 'desc')), (snapshot) => {
      setLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubIncidents = onSnapshot(query(collection(db, 'incidents'), orderBy('timestamp', 'desc')), (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    
    const unsubAssign = onSnapshot(query(collection(db, 'assignments'), orderBy('timestamp', 'desc')), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubBroadcasts = onSnapshot(query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc')), (snapshot) => {
      setBroadcasts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    
    


    const unsubForms = onSnapshot(query(collection(db, 'statutory_forms'), orderBy('timestamp', 'desc')), (snapshot) => {
      setForms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubIncidents();
      unsubAssign();
      unsubBroadcasts();
      unsubForms();
    };
  }, []);


  const handleViewPDF = (form) => {
    const printWindow = window.open('', '_blank');
    
    let formHtml = `
      <html>
        <head>
          <title>${form.formType} - DGMS Statutory Filing</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
            .header { border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #1e3a8a; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12px; color: #555; }
            .field-group { margin-bottom: 15px; }
            .label { font-weight: bold; font-size: 12px; color: #555; text-transform: uppercase; }
            .value { font-size: 16px; margin-top: 4px; padding: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; }
            .footer { margin-top: 50px; font-size: 10px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
            @media print { .value { border: none; background: transparent; padding: 0; } body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Directorate General of Mines Safety</div>
            <div class="subtitle">Statutory Filing Archive - ${form.formType}</div>
          </div>
          
          <div class="meta">
            <div><strong>Filed By:</strong> ${form.submittedByName || 'Unknown'} (${form.submittedByRole || 'Manager'})</div>
            <div><strong>Timestamp:</strong> ${form.timestamp ? new Date(form.timestamp.toDate()).toLocaleString() : 'N/A'}</div>
          </div>
    `;

    Object.entries(form).forEach(([key, value]) => {
      if (['formType', 'submittedBy', 'timestamp', 'id', 'submittedByName', 'submittedByRole'].includes(key)) return;
      
      const formattedLabel = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
      formHtml += `
        <div class="field-group">
          <div class="label">${formattedLabel}</div>
          <div class="value">${value || 'N/A'}</div>
        </div>
      `;
    });

    formHtml += `
          <div class="footer">
            Digitally archived via KhananSathi Compliance Platform.<br>
            Generated on ${new Date().toLocaleString()}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(formHtml);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  // Aggregations
  const totalMines = mlData.length;
  const totalWorkforce = allUsers.filter(u => u.role === 'worker').length;
  const criticalAlerts = incidents.filter(i => (i.severity === 'Critical' || i.severity === 'High') && i.status !== 'RESOLVED');

  const managers = allUsers.filter(u => u.role === 'manager' && (
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const filteredIncidents = incidents.filter(i => 
    (i.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (i.severity || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredForms = forms.filter(f => 
    (f.formType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.submittedByName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        userRole={userDocData?.role} 
        userEmail={userDocData?.email}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Globe className="text-indigo-600" size={24} />
              National Command Center
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">Ministry of Coal • Central Authority</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:bg-white transition-all w-64"
              />
            </div>
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold border border-indigo-200 shadow-sm">
              <Shield size={20} />
            </div>
          </div>
        </div>

        <div className="p-8 max-w-7xl mx-auto">
{activeTab === 'ai_rankings' && (
            <AdminOverview 
                searchQuery={searchTerm} 
                setSearchQuery={setSearchTerm} 
                onAssignClick={(mine) => {
                  setSelectedMineForAssign(mine);
                  setActiveTab('assign');
                }}
              />
          )}

{activeTab === 'join_requests' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">National Join Requests</h2>
              <JoinRequests allUsers={allUsers} userEmail={userDocData?.email} scope="national" />
            </div>
          )}

          {activeTab === 'national_overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="p-4 bg-blue-100/80 rounded-xl text-blue-600 backdrop-blur-sm"><Briefcase size={28} /></div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Registered Mines</h3>
                      <p className="text-4xl font-black text-slate-800">{totalMines}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="p-4 bg-emerald-100/80 rounded-xl text-emerald-600 backdrop-blur-sm"><Users size={28} /></div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Workforce</h3>
                      <p className="text-4xl font-black text-slate-800">{totalWorkforce.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                  <div className="relative z-10 flex items-center gap-5">
                    <div className="p-4 bg-rose-100/80 rounded-xl text-rose-600 backdrop-blur-sm">
                      <AlertTriangle size={28} className={criticalAlerts.length > 0 ? "animate-pulse" : ""} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Critical Alerts</h3>
                      <p className="text-4xl font-black text-slate-800">{criticalAlerts.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-indigo-500" /> Recent Filings (Forms)
                  </h3>
                  <div className="space-y-3">
                    {forms.slice(0, 5).map(f => (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <div className="font-bold text-slate-700 text-sm">{f.formType}</div>
                          <div className="text-xs text-slate-500">By: {f.submittedByName || 'Unknown'}</div>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {f.timestamp ? new Date(f.timestamp.toDate()).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    ))}
                    {forms.length === 0 && <p className="text-sm text-slate-400">No forms filed recently.</p>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-rose-500" /> Active Critical Hazards
                  </h3>
                  <div className="space-y-3">
                    {criticalAlerts.slice(0, 5).map(a => (
                      <div key={a.id} className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100">
                        <AlertTriangle size={16} className="text-rose-600 mt-0.5 shrink-0" />
                        <div>
                          <div className="font-bold text-rose-900 text-sm">{a.severity} Severity</div>
                          <div className="text-xs text-rose-700 mt-1 line-clamp-2">{a.description}</div>
                        </div>
                      </div>
                    ))}
                    {criticalAlerts.length === 0 && (
                      <div className="text-sm text-emerald-600 flex items-center gap-2 bg-emerald-50 p-4 rounded-xl">
                        <CheckCircle2 size={18} /> No critical alerts nationwide.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mines_directory' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Mines Directory</h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4 border-b border-slate-200">Mine Manager</th>
                      <th className="px-6 py-4 border-b border-slate-200">Email Contact</th>
                      <th className="px-6 py-4 border-b border-slate-200">Auth Status</th>
                      <th className="px-6 py-4 border-b border-slate-200">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {managers.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-800">{m.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-slate-600">{m.email}</td>
                        <td className="px-6 py-4">
                          {m.approved ? (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">Approved</span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">Pending Review</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs">
                          {m.createdAt ? new Date(m.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                    {managers.length === 0 && (
                      <tr><td colSpan="4" className="p-8 text-center text-slate-400">No managers found matching search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'global_alerts' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">National Incident Desk</h2>
              <p className="text-sm text-slate-500 mb-4">View and override hazard resolutions nationwide.</p>
              <IncidentDesk incidents={filteredIncidents} scope="national" />
            </div>
          )}

{activeTab === 'tracker' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">National Audit Tracker</h2>
              <AuditTracker assignments={assignments} scope="national" />
            </div>
          )}

          {activeTab === 'leave_approvals' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">National Leave Approvals</h2>
              <LeaveApprovals leaveRequests={leaveRequests} scope="national" />
            </div>
          )}

          {activeTab === 'broadcasts' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">National Broadcast System</h2>
              <Broadcasts broadcasts={broadcasts} scope="national" userDocData={userDocData} />
            </div>
          )}

          {activeTab === 'attendance_logs' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AdminAttendanceLogs />
            </div>
          )}

          {activeTab === 'forms' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Statutory Forms Archive</h2>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                      <th className="px-6 py-4 border-b border-slate-200">DGMS Form ID</th>
                      <th className="px-6 py-4 border-b border-slate-200">Submitted By</th>
                      <th className="px-6 py-4 border-b border-slate-200">Role</th>
                      <th className="px-6 py-4 border-b border-slate-200">Date Filed</th>
                      <th className="px-6 py-4 border-b border-slate-200">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredForms.map(f => (
                      <tr key={f.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-indigo-700">{f.formType}</td>
                        <td className="px-6 py-4 text-slate-800 font-semibold">{f.submittedByName || 'Unknown'}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs capitalize">{f.submittedByRole || 'Manager'}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                          {f.timestamp ? new Date(f.timestamp.toDate()).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleViewPDF(f)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                            View PDF <ChevronRight size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredForms.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-slate-400">No statutory forms filed yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
