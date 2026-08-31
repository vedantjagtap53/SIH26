import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Activity, ShieldAlert, ClipboardList, Camera, Calendar } from 'lucide-react';

import SafetyHub from '../components/worker/SafetyHub';
import ReportHazard from '../components/worker/ReportHazard';
import MyReports from '../components/worker/MyReports';
import WorkerLeaves from '../components/worker/WorkerLeaves';
import WorkerAttendance from '../components/worker/WorkerAttendance';

export default function WorkerHome({ userDocData }) {
  const [activeTab, setActiveTab] = useState('safety');
  
  const [broadcasts, setBroadcasts] = useState([]);
  const [myIncidents, setMyIncidents] = useState([]);
  const [myLeaves, setMyLeaves] = useState([]);

  useEffect(() => {
    if (!userDocData?.uid) return;

    const unsubBroadcasts = onSnapshot(query(collection(db, 'broadcasts'), orderBy('timestamp', 'desc')), (snapshot) => {
      setBroadcasts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubInc = onSnapshot(query(collection(db, 'incidents'), where('reporterUid', '==', userDocData.uid)), (snapshot) => {
      // Sort in memory since Firestore requires composite index for where + orderBy
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setMyIncidents(data);
    });

    const unsubLeaves = onSnapshot(query(collection(db, 'leave_requests'), where('workerUid', '==', userDocData.uid)), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
      setMyLeaves(data);
    });

    return () => {
      unsubBroadcasts();
      unsubInc();
      unsubLeaves();
    };
  }, [userDocData]);

  const activeReportsCount = myIncidents.filter(i => i.status !== 'RESOLVED').length;

  return (
    <div className="flex h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar userRole="worker" userEmail={userDocData?.email} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header title="Worker KhananSathi" userEmail={userDocData?.email} />
        
        

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-4xl mx-auto pb-12">
            {activeTab === 'safety' && <SafetyHub broadcasts={broadcasts} />}
            {activeTab === 'report' && <ReportHazard userDocData={userDocData} setActiveTab={setActiveTab} />}
            {activeTab === 'my_reports' && <MyReports incidents={myIncidents} />}
            {activeTab === 'leaves' && <WorkerLeaves userDocData={userDocData} leaves={myLeaves} />}
            {activeTab === 'attendance' && <WorkerAttendance userDocData={userDocData} />}
          </div>
        </div>
      </div>
    </div>
  );
}
