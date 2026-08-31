import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function Header({ title, userEmail }) {
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  return (
    <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
      <h2 className="text-lg font-black text-gray-900 tracking-tight">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-indigo-600 transition-colors">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-gray-900 leading-none">{userEmail || 'Active User'}</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1">● Online & Authenticated</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors"
            title="Secure Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
