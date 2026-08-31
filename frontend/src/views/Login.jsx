import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  sendSignInLinkToEmail 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { HardHat, ShieldAlert, Sparkles, Activity, Lock, ArrowRight, UserPlus, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Sign In State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign Up State
  const [signupEmail, setSignupEmail] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState('worker');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // App.jsx will handle redirect based on role
    } catch (err) {
      console.error(err);
      setStatus("Invalid credentials or account not found.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('');
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/',
        handleCodeInApp: true,
      };
      
      await sendSignInLinkToEmail(auth, signupEmail, actionCodeSettings);
      
      // Save email for when they return to click the link
      window.localStorage.setItem('emailForSignIn', signupEmail);
      window.localStorage.setItem('signupPassword', signupPassword);
      window.localStorage.setItem('signupRole', signupRole);
      window.localStorage.setItem('signupName', signupName);
      
      

      setStatus("Magic link sent! Check your inbox to verify your email. Mine Management will then review your request.");
      setSignupEmail('');
      setSignupName('');
      setSignupPassword('');
    } catch (err) {
      console.error(err);
      setStatus("Error sending magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-600/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-600/5 blur-[120px]" />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-slate-100">
        
        {/* Left Side: Branding & Info */}
        <div className="w-full md:w-5/12 bg-slate-900 p-10 flex flex-col justify-between relative overflow-hidden text-white">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <HardHat size={22} className="text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">KhananSathi</h1>
            </div>

            <h2 className="text-3xl font-black mb-6 leading-tight">
              Coal Mine<br/>Safety Operations
            </h2>
            <p className="text-slate-400 text-sm mb-10 font-medium leading-relaxed">
              Secure portal for statutory inspections, real-time hazard reporting, and workforce governance.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30">
                  <Activity size={14} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">ML Risk Targeting</h4>
                  <p className="text-xs text-slate-500 mt-1">Predictive hazard analytics</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ShieldAlert size={14} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-200">Digital Audits</h4>
                  <p className="text-xs text-slate-500 mt-1">Tamper-proof compliance records</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-6 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex justify-between items-center">
            <span>v2.1.0-secure</span>
            <span>DGMS Compliant</span>
          </div>
        </div>

        {/* Right Side: Auth Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-12 relative bg-white">
          
          <div className="flex justify-end mb-8 relative z-20">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 font-bold text-xs shadow-inner">
              <button 
                onClick={() => { setIsSignUp(false); setStatus(''); }}
                className={`px-6 py-2 rounded-lg transition-all ${!isSignUp ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsSignUp(true); setStatus(''); }}
                className={`px-6 py-2 rounded-lg transition-all ${isSignUp ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Request Access
              </button>
            </div>
          </div>

          <div className="max-w-sm mx-auto mt-4">
            {!isSignUp ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Welcome Back</h3>
                <p className="text-sm font-medium text-slate-500 mb-8">Enter your credentials to access the secure portal.</p>

                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email" required
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder="officer@khanansathi.in"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Password</label>
                    <input 
                      type="password" required
                      value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>

                  {status && (
                    <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center gap-2">
                      <Lock size={14} /> {status}
                    </div>
                  )}

                  <button 
                    type="submit" disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 text-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                  >
                    {isLoading ? 'Authenticating...' : (
                      <>Secure Login <ArrowRight size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Request Access</h3>
                <p className="text-sm font-medium text-slate-500 mb-6">Receive a magic link to verify your email. Set a password for future logins.</p>

                <form onSubmit={handleMagicLinkSignUp} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" required
                      value={signupName} onChange={e => setSignupName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Official Email</label>
                    <input 
                      type="email" required
                      value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Set Password</label>
                    <input 
                      type="password" required minLength="6"
                      value={signupPassword} onChange={e => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:border-indigo-500"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Requested Role</label>
                    <select 
                      value={signupRole} onChange={e => setSignupRole(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="worker">Field Worker</option>
                      <option value="inspector">Statutory Inspector</option>
                    </select>
                  </div>

                  {status && (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 flex items-center gap-2">
                      <CheckCircle2 size={16} className="shrink-0" /> {status}
                    </div>
                  )}

                  <button 
                    type="submit" disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 text-sm transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                  >
                    {isLoading ? 'Sending Link...' : (
                      <>Send Magic Link <Sparkles size={16} /></>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
