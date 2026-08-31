import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { Clock, MapPin, Search, RefreshCw, AlertCircle } from 'lucide-react';

export default function AdminAttendanceLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'attendance'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLogs(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore Attendance error:', err);
        setError(err.message || 'Permission denied or failed to load attendance logs.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return 'N/A';
    try {
      let date;
      if (typeof ts === 'object' && typeof ts.toDate === 'function') {
        date = ts.toDate();
      } else if (typeof ts === 'object' && ts.seconds) {
        date = new Date(ts.seconds * 1000);
      } else {
        date = new Date(ts);
      }
      
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  const filteredLogs = logs.filter(log => 
    (log.name || log.workerName || log.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Attendance Logs</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Real-time GPS clock-ins from all mine personnel.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center gap-3 text-xs font-semibold">
          <AlertCircle size={18} className="shrink-0 text-rose-500" />
          <span>{error} — Please ensure updated Firestore security rules have been deployed.</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or role..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div className="text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
            Total Records: {filteredLogs.length}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider">
                <th className="px-6 py-4 border-b border-slate-200">Personnel</th>
                <th className="px-6 py-4 border-b border-slate-200">Role</th>
                <th className="px-6 py-4 border-b border-slate-200">Action</th>
                <th className="px-6 py-4 border-b border-slate-200">Time</th>
                <th className="px-6 py-4 border-b border-slate-200">Location (GPS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-indigo-500" />
                      <span>Loading attendance data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    {searchTerm ? 'No matching attendance logs found.' : 'No attendance logs recorded yet. Punch in from the Worker or Inspector portal to record the first entry.'}
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{log.name || log.workerName || log.email || 'Personnel'}</td>
                    <td className="px-6 py-4 text-slate-600 capitalize">{log.role || 'worker'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        log.type === 'CLOCK_IN' || log.type === 'clock-in' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {log.type === 'CLOCK_IN' || log.type === 'clock-in' ? 'Clock In' : 'Clock Out'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {log.location ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-mono bg-slate-100 px-2 py-1 rounded inline-flex">
                          <MapPin size={12} className="text-indigo-500" />
                          {Number(log.location.latitude ?? log.location.lat ?? 0).toFixed(5)}, {Number(log.location.longitude ?? log.location.lng ?? 0).toFixed(5)}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No GPS</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
