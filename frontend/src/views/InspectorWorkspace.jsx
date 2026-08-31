import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { ClipboardCheck, Layers, ShieldAlert, Camera } from 'lucide-react';

import InspectorTasks from '../components/inspector/InspectorTasks';
import ActiveAudit from '../components/inspector/ActiveAudit';
import HazardDossier from '../components/inspector/HazardDossier';
import InspectorAttendance from '../components/inspector/InspectorAttendance';
import StatutoryForms from '../components/shared/StatutoryForms';

export default function InspectorWorkspace({ userDocData }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [assignments, setAssignments] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  useEffect(() => {
    if (!userDocData?.uid) return;

    // Fetch assignments where inspectorUid == currentUser.uid
    const qTasks = query(
      collection(db, 'assignments'), 
      where('inspectorUid', '==', userDocData.uid)
    );
    const unsubTasks = onSnapshot(qTasks, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch all unresolved incidents for dossier
    const qIncidents = query(
      collection(db, 'incidents'),
      where('status', '!=', 'RESOLVED')
    );
    const unsubIncidents = onSnapshot(qIncidents, (snapshot) => {
      setIncidents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubTasks();
      unsubIncidents();
    };
  }, [userDocData]);

  const handleStartAudit = (task) => {
    setActiveTask(task);
    setActiveTab('audit');
  };

  const pendingCount = assignments.filter(a => a.status !== 'COMPLETED' && a.status !== 'VERIFIED').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar userRole="inspector" userEmail={userDocData?.email} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Statutory Inspector Workspace" userEmail={userDocData?.email} />
        
        

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto pb-12">
            {activeTab === 'tasks' && <InspectorTasks assignments={assignments} onStartAudit={handleStartAudit} />}
            {activeTab === 'audit' && <ActiveAudit activeTask={activeTask} setActiveTask={setActiveTask} userDocData={userDocData} />}
            {activeTab === 'dossier' && <HazardDossier incidents={incidents} />}
            {activeTab === 'attendance' && <InspectorAttendance userDocData={userDocData} />}
            {activeTab === 'forms' && <StatutoryForms userDocData={userDocData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
