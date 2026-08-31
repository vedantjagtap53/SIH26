import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ShieldAlert, Users, ClipboardCheck, Activity, UserCheck, CheckCircle2, Search, Filter, Layers, Calendar, Megaphone } from 'lucide-react';

import WorkerLeaves from '../components/worker/WorkerLeaves';
import ReportHazard from '../components/worker/ReportHazard';
import AdminOverview from '../components/admin/AdminOverview';
import JoinRequests from '../components/admin/JoinRequests';
import AssignInspection from '../components/admin/AssignInspection';
import AuditTracker from '../components/admin/AuditTracker';
import AuditVerification from '../components/admin/AuditVerification';
import IncidentDesk from '../components/admin/IncidentDesk';
import Broadcasts from '../components/admin/Broadcasts';
import LeaveApprovals from '../components/admin/LeaveApprovals';
import StatutoryForms from '../components/shared/StatutoryForms';
import AdminAttendanceLogs from '../components/admin/AdminAttendanceLogs';

export default function ManagerDashboard({ userDocData }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [mlRankings, setMlRankings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hazardFilter, setHazardFilter] = useState('ALL');
  const [selectedMine, setSelectedMine] = useState(null);

  // Firestore Data State
  const [allUsers, setAllUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    // Fetch ML Rankings

    // Firestore Listeners
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAssign = onSnapshot(query(collection(db, 'assignments'), orderBy('timestamp', 'desc')), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubInspect = onSnapshot(query(collection(db, 'inspections'), orderBy('timestamp', 'desc')), (snapshot) => {
      setInspections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubIncidents = onSnapshot(query(collection(db, 'incidents'), orderBy('timestamp', 'desc')), (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    
    const unsubMyLeaves = onSnapshot(query(collection(db, 'leave_requests'), where('workerEmail', '==', userDocData.email), orderBy('timestamp', 'desc')), (snapshot) => {
      setMyLeaves(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubLeaves = onSnapshot(query(collection(db, 'leave_requests'), orderBy('timestamp', 'desc')), (snapshot) => {
      setLeaveRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubBroadcasts = onSnapshot(query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc')), (snapshot) => {
      setBroadcasts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubUsers();
      unsubAssign();
      unsubInspect();
      unsubIncidents();
      unsubLeaves();
      unsubBroadcasts();
    };
  }, []);

  const pendingRequestsCount = allUsers.filter(u => u.approved !== true).length;
  const pendingAuditsCount = inspections.filter(i => i.status !== 'VERIFIED').length;
  const unresolvedIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
  const pendingLeavesCount = leaveRequests.filter(lr => lr.status === 'PENDING').length;

  const handleAssignClick = (mine) => {
    setSelectedMine(mine);
    setActiveTab('assign');
  };

  const TABS = [
    { id: 'overview', label: 'ML Operations Desk', icon: <Activity size={16} /> },
    { id: 'join_requests', label: 'Workforce Directory', icon: <UserCheck size={16} />, badge: pendingRequestsCount },
    { id: 'assign', label: 'Dispatch Orders', icon: <ClipboardCheck size={16} /> },
    { id: 'tracker', label: 'Live Audit Tracker', icon: <Layers size={16} /> },
    { id: 'verification', label: 'Audit Verification', icon: <CheckCircle2 size={16} />, badge: pendingAuditsCount },
    { id: 'incidents', label: 'Hazard Response', icon: <ShieldAlert size={16} />, badge: unresolvedIncidentsCount },
    { id: 'leaves', label: 'Leave Approvals', icon: <Calendar size={16} />, badge: pendingLeavesCount },
    { id: 'broadcast', label: 'Broadcast', icon: <Megaphone size={16} /> }
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar userRole={userDocData?.role || "manager"} userEmail={userDocData?.email} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="SuperAdmin Command Center" userEmail={userDocData?.email} />
        
        {/* Navigation Tabs */}
        

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-12">
            
{activeTab === 'report' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Report Hazard / Request Inspection</h2>
                <p className="text-sm text-slate-500 mb-4">Hazards reported here are sent directly to the Super Admin.</p>
                <ReportHazard userDocData={userDocData} setActiveTab={setActiveTab} />
              </div>
            )}

            {activeTab === 'overview' && (
              <AdminOverview 
                mlRankings={mlRankings} 
                pendingRequestsCount={pendingRequestsCount}
                assignmentsCount={assignments.length}
                incidentsCount={unresolvedIncidentsCount}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                hazardFilter={hazardFilter}
                setHazardFilter={setHazardFilter}
                onAssignClick={handleAssignClick}
              />
            )}

            {activeTab === 'requests' && (
              <JoinRequests allUsers={allUsers} userEmail={userDocData?.email} />
            )}

            {activeTab === 'assign' && (
              <AssignInspection 
                mlRankings={mlRankings} 
                allUsers={allUsers}
                selectedMine={selectedMine}
                setSelectedMine={setSelectedMine}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'tracker' && (
              <AuditTracker assignments={assignments} />
            )}

            {activeTab === 'verification' && (
              <AuditVerification inspections={inspections} assignments={assignments} />
            )}

            {activeTab === 'incidents' && (
              <IncidentDesk incidents={incidents} />
            )}

            {activeTab === 'leaves' && (
              <LeaveApprovals leaveRequests={leaveRequests} />
            )}

            {activeTab === 'forms' && (
              <StatutoryForms userDocData={userDocData} />
            )}

            {activeTab === 'attendance_logs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <AdminAttendanceLogs />
              </div>
            )}

            {activeTab === 'broadcasts' && (
              <Broadcasts broadcasts={broadcasts} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
