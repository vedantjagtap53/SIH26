import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, isSignInWithEmailLink, signInWithEmailLink, updatePassword, signOut } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

import Login from './views/Login';
import ManagerDashboard from './views/ManagerDashboard';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import InspectorWorkspace from './views/InspectorWorkspace';
import WorkerHome from './views/WorkerHome';
import { Clock, LogOut, CheckCircle2 } from 'lucide-react';

function App() {
  const [user, setUser] = useState(null);
  const [userDocData, setUserDocData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [magicLinkNotice, setMagicLinkNotice] = useState('');

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem('emailForSignIn');
      const urlParams = new URLSearchParams(window.location.search);
      if (!email) {
        email = urlParams.get('signupEmail') || window.prompt('Please confirm your email address to complete verification:');
      }

      if (email) {
        const signupRole = urlParams.get('signupRole') || window.localStorage.getItem('signupRole') || 'worker';
        const signupName = urlParams.get('signupName') || window.localStorage.getItem('signupName') || email.split('@')[0];
        const signupPassword = window.localStorage.getItem('signupPassword');

        signInWithEmailLink(auth, email, window.location.href)
          .then(async (result) => {
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('signupRole');
            window.localStorage.removeItem('signupName');
            window.localStorage.removeItem('signupPassword');

            if (signupPassword && result.user) {
              try {
                await updatePassword(result.user, signupPassword);
              } catch (passErr) {
                console.warn('Could not set password:', passErr);
              }
            }

            const userDocRef = doc(db, 'users', result.user.uid);
            const initialData = {
              uid: result.user.uid,
              email: email,
              fullName: signupName,
              role: signupRole,
              emailVerified: true,
              approved: false,
              status: 'PENDING_APPROVAL',
              registeredAt: serverTimestamp()
            };

            await setDoc(userDocRef, initialData, { merge: true });
            setUser(result.user);
            setUserDocData(initialData);
            setMagicLinkNotice(`Email verified successfully! Your request to join as ${signupRole.toUpperCase()} has been submitted to Mine Management.`);
          })
          .catch((error) => {
            console.error('Magic link sign-in error:', error);
          });
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setLoading(true);
        setUser(currentUser);
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserDocData({ uid: currentUser.uid, ...snap.data() });
          } else {
            const isAdmin = currentUser.email.toLowerCase().includes('admin');
            const fallback = {
              uid: currentUser.uid,
              email: currentUser.email,
              role: isAdmin ? 'admin' : 'worker',
              emailVerified: currentUser.emailVerified || false,
              approved: isAdmin ? true : false,
              status: isAdmin ? 'ACTIVE' : 'PENDING_APPROVAL',
              createdAt: serverTimestamp()
            };
            await setDoc(userDocRef, fallback);
            setUserDocData(fallback);
          }
        } catch (e) {
          console.warn('Error reading user doc:', e);
        }
      } else {
        setUser(null);
        setUserDocData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-white font-bold text-sm tracking-wide">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Authenticating KhananSathi Session...</span>
        </div>
      </div>
    );
  }

  if (user && userDocData && userDocData.approved !== true) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
        <div className="w-full max-w-lg bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl text-white text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/20 border border-amber-400/40 text-amber-300 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/10">
            <Clock size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30">
              Email Verified
            </span>
            <h2 className="text-2xl font-black text-white mt-3">Joining Request Pending Approval</h2>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Your email <strong className="text-white">({user.email})</strong> is confirmed, and your request to join as <strong className="text-indigo-300 capitalize">{userDocData.role || 'Worker'}</strong> has been sent to Mine Management.
            </p>
          </div>
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-white/10 text-xs text-slate-400 space-y-1.5 text-left">
            <div><strong>Status:</strong> <span className="text-amber-400 font-bold">Awaiting Sanction</span></div>
            <div><strong>Requested Role:</strong> <span className="font-mono text-white capitalize">{userDocData.role}</span></div>
            <div><strong>UID:</strong> <span className="font-mono text-[10px] text-slate-400">{user.uid}</span></div>
          </div>
          {magicLinkNotice && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs rounded-xl flex items-center justify-center gap-1.5">
              <CheckCircle2 size={16} /> {magicLinkNotice}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-600/30 text-xs transition-all cursor-pointer"
            >
              Check Approval Status
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const role = userDocData?.role || 'worker';

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? (
              <Login />
            ) : (
              role === 'admin' ? <Navigate to="/admin" replace /> :
              role === 'manager' ? <Navigate to="/manager" replace /> :
              role === 'inspector' ? <Navigate to="/inspector" replace /> :
              <Navigate to="/worker" replace />
            )
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : role === 'admin' ? (
              <SuperAdminDashboard userDocData={userDocData} />
            ) : (
              <Navigate to={`/${role}`} replace />
            )
          } 
        />

        <Route 
          path="/manager" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : role === 'manager' ? (
              <ManagerDashboard userDocData={userDocData} />
            ) : (
              <Navigate to={`/${role}`} replace />
            )
          } 
        />

        <Route 
          path="/inspector" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : (role === 'inspector' || role === 'manager' || role === 'admin') ? (
              <InspectorWorkspace userDocData={userDocData} />
            ) : (
              <Navigate to="/worker" replace />
            )
          } 
        />

        <Route 
          path="/worker" 
          element={
            !user ? (
              <Navigate to="/" replace />
            ) : (
              <WorkerHome userDocData={userDocData} />
            )
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
