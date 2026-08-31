import React from 'react';
import BentoCard from '../BentoCard';
import { UserCheck, CheckCircle2, Users } from 'lucide-react';
import { db } from '../../firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function JoinRequests({ allUsers, userEmail, scope = 'local' }) {
  const scopeFilteredUsers = allUsers.filter(u => {
    if (scope === 'national') return u.role === 'manager' || u.role === 'inspector';
    return u.role === 'worker';
  });
  
  const pendingJoinRequests = scopeFilteredUsers.filter(u => u.approved !== true);
  const approvedUsers = scopeFilteredUsers.filter(u => u.approved === true);

  const handleApproveUser = async (userId, targetRole) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        status: 'APPROVED',
        role: targetRole || 'worker',
        approvedAt: serverTimestamp(),
        approvedBy: userEmail || 'SuperAdmin'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectUser = async (userId) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: false,
        status: 'REJECTED',
        rejectedAt: serverTimestamp()
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      <BentoCard title="Pending User Join Requests (Email Verified via Magic Link)" icon={<UserCheck size={20} />}>
        {pendingJoinRequests.length === 0 ? (
          <div className="text-center py-8 text-xs text-gray-500">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            No pending user registration requests. All verified users have been sanctioned.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                  <th className="py-3 px-3">Full Name / Email</th>
                  <th className="py-3 px-3">Requested Role</th>
                  <th className="py-3 px-3">Email Verification</th>
                  <th className="py-3 px-3 text-right">Sanction Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {pendingJoinRequests.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-gray-900">{u.fullName || u.email?.split('@')[0]}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-bold uppercase text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                        {u.role || 'Worker'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-emerald-700 bg-emerald-50 font-bold text-[10px] px-2 py-0.5 rounded flex items-center gap-1 w-fit">
                        <CheckCircle2 size={12} /> Verified
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right space-x-2">
                      <button
                        onClick={() => handleApproveUser(u.id, u.role)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Approve & Grant Access
                      </button>
                      <button
                        onClick={() => handleRejectUser(u.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs px-3.5 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </BentoCard>

      <BentoCard title="Active Sanctioned Workforce & Role Directory" icon={<Users size={20} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] uppercase tracking-wider text-gray-400 font-bold">
                <th className="py-3 px-3">Officer / User</th>
                <th className="py-3 px-3">RBAC Role</th>
                <th className="py-3 px-3">Approval Status</th>
                <th className="py-3 px-3 text-right">Role Governance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {approvedUsers.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900">{u.fullName || u.email?.split('@')[0]}</div>
                    <div className="text-[11px] text-gray-500">{u.email}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-md ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      u.role === 'inspector' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                      ● Active
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleRejectUser(u.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>
    </div>
  );
}
