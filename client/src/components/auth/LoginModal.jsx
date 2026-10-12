import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Droplet, Shield, Key, UserCheck, X, ArrowRight, Lock, Check } from 'lucide-react';

export default function LoginModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, DEMO_ACCOUNTS, currentUser, switchRole, login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleManualLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = login(email, password);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  const handleQuickLogin = (acc) => {
    switchRole(acc.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 p-6 text-white relative">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Droplet className="w-7 h-7 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">WaterGuard Authentication</h2>
              
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Quick 1-Click Role Switcher */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600" />
                1-Click Demo Login by Role
              </span>
              <span className="text-xs text-blue-600 font-medium">Instant Access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((acc) => {
                const isActive = currentUser?.id === acc.id;
                return (
                  <button
                    key={acc.id}
                    onClick={() => handleQuickLogin(acc)}
                    className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
                      isActive
                        ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full ${acc.avatarBg} text-white font-bold text-xs flex items-center justify-center`}>
                            {acc.avatar}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{acc.name}</div>
                            <div className="text-[11px] text-blue-600 font-medium">{acc.roleLabel}</div>
                          </div>
                        </div>

                        {isActive && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {acc.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        {/* Credentials hidden - use manual login or demo role switch */}
                      </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            
          </div>

          {/* Manual Login Form */}
          <form onSubmit={handleManualLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. engineer@waterguard.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="e.g. admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to WaterGuard</span>
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
