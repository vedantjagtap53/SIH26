import React from 'react';
import { ClipboardList, Shield, Calendar, UserCheck, LogOut, Activity, Users, ClipboardCheck, ShieldAlert, CheckCircle, Radio, Megaphone, CalendarClock, Layers, Camera, AlertTriangle, FileText, Briefcase, Settings } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

export default function Sidebar({ userEmail, userRole, activeTab, setActiveTab }) {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const superAdminTabs = [
    { id: 'national_overview', icon: <Briefcase size={18} />, label: 'National Overview' },
    { id: 'ai_rankings', icon: <Activity size={18} />, label: 'AI Risk Forecast' },
    { id: 'mines_directory', icon: <Users size={18} />, label: 'Mines Directory' },
    { id: 'global_alerts', icon: <AlertTriangle size={18} />, label: 'National Incident Desk' },
    { id: 'tracker', icon: <Layers size={18} />, label: 'National Audit Tracker' },
    { id: 'forms', icon: <FileText size={18} />, label: 'Statutory Archive' },
    { id: 'attendance_logs', icon: <ClipboardList size={18} />, label: 'Attendance Logs' },
    { id: 'join_requests', icon: <UserCheck size={18} />, label: 'Join Requests' },
    { id: 'leave_approvals', icon: <Calendar size={18} />, label: 'Leave Approvals' },
    { id: 'broadcasts', icon: <Megaphone size={18} />, label: 'Broadcasts' }
  ];

  const managerTabs = [
    { id: 'overview', label: 'AI Risk Forecast', icon: <Activity size={18} /> },
    { id: 'requests', label: 'Join Requests', icon: <Users size={18} /> },
    { id: 'tracker', label: 'Audit Tracker', icon: <ShieldAlert size={18} /> },
    { id: 'verification', label: 'Review Evidence', icon: <CheckCircle size={18} /> },
    { id: 'incidents', label: 'Incident Desk', icon: <Radio size={18} /> },
    { id: 'broadcasts', label: 'Broadcasts', icon: <Megaphone size={18} /> },
    { id: 'leaves', label: 'Leave Approvals', icon: <CalendarClock size={18} /> },
    { id: 'attendance_logs', icon: <ClipboardList size={18} />, label: 'Attendance Logs' },
    { id: 'forms', label: 'Statutory Forms', icon: <FileText size={18} /> },
  ];

  const inspectorTabs = [
    { id: 'tasks', label: 'My Tasks', icon: <ClipboardCheck size={18} /> },
    { id: 'audit', label: 'Active Audit', icon: <Layers size={18} /> },
    { id: 'dossier', label: 'Hazard Dossier', icon: <ShieldAlert size={18} /> },
    { id: 'attendance', label: 'Mark Attendance', icon: <Camera size={18} /> },
    { id: 'forms', label: 'Statutory Forms', icon: <FileText size={18} /> },
  ];

  const workerTabs = [
    { id: 'safety', label: 'Safety Hub', icon: <ShieldAlert size={18} /> },
    { id: 'report', label: 'Report Hazard', icon: <AlertTriangle size={18} /> },
    { id: 'my_reports', label: 'My Reports', icon: <FileText size={18} /> },
    { id: 'attendance', label: 'Face Attendance', icon: <Camera size={18} /> },
    { id: 'leaves', label: 'Leave Requests', icon: <CalendarClock size={18} /> },
  ];

  let currentTabs = [];
  if (userRole === 'admin') currentTabs = superAdminTabs;
  if (userRole === 'manager') currentTabs = managerTabs;
  if (userRole === 'inspector') currentTabs = inspectorTabs;
  if (userRole === 'worker') currentTabs = workerTabs;

  return (
    <aside className="w-64 glass-panel border-r border-slate-700/50 h-screen sticky top-0 flex flex-col p-4 z-20 shrink-0 select-none bg-[#0f172a] text-slate-200">
      <div className="flex items-center gap-3 px-3 py-3 mb-6 border-b border-slate-800 pb-5">
        <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-lg shadow-indigo-600/30">
          <Shield size={22} />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-white text-base leading-tight truncate">KhananSathi</h1>
          <span className="text-[11px] uppercase font-bold text-indigo-400 tracking-wider">
            {userRole === 'admin' ? 'Central Authority' : userRole === 'manager' ? 'Mine Command Center' : userRole ? `${userRole} portal` : 'Portal'}
          </span>
        </div>
      </div>

      <div className="mb-6 px-4 py-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs shadow-inner">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Authenticated User</div>
        <div className="font-semibold text-slate-100 truncate text-[11px] mt-0.5">{userEmail || 'Active Session'}</div>
        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
          ● Identity Verified
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1 hide-scrollbar">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-3 mb-2 mt-4">Main Menu</div>
        {currentTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab && setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                isActive 
                  ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-inner' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                {tab.icon}
              </div>
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs text-red-400 hover:bg-red-500/10 transition-all cursor-pointer border border-transparent hover:border-red-500/20"
        >
          <LogOut size={18} />
          Secure Sign Out
        </button>
      </div>
    </aside>
  );
}
