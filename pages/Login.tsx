import React, { useState } from 'react';
import { Shield, User, Car, Lock, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface LoginProps {
  onLogin: (role: UserRole, name: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'COMMUTER' | 'ADMIN'>('COMMUTER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Commuter State
  const [commuterName, setCommuterName] = useState('');
  const [commuterEmail, setCommuterEmail] = useState('');

  // Admin State
  const [adminBadge, setAdminBadge] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      if (activeTab === 'ADMIN') {
        if (adminBadge === 'BADGE-88' && adminPass === 'secure123') {
          onLogin('ADMIN', 'Officer Davis');
        } else {
          setError('Invalid Credentials. Try BADGE-88 / secure123');
          setLoading(false);
        }
      } else {
        if (commuterName) {
          onLogin('COMMUTER', commuterName);
        } else {
          setError('Please enter your name');
          setLoading(false);
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to ATMS</h1>
            <p className="text-slate-400 text-sm">Autonomous Traffic Management System</p>
          </div>

          {/* Tabs */}
          <div className="bg-slate-800 p-1 rounded-xl flex mb-8">
            <button 
              onClick={() => { setActiveTab('COMMUTER'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'COMMUTER' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <User size={16} /> Commuter
            </button>
            <button 
              onClick={() => { setActiveTab('ADMIN'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'ADMIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              <Shield size={16} /> Official
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {activeTab === 'COMMUTER' ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="John Doe"
                            value={commuterName}
                            onChange={(e) => setCommuterName(e.target.value)}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
                    <div className="relative">
                        <Car className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input 
                            type="email" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            placeholder="john@example.com"
                            value={commuterEmail}
                            onChange={(e) => setCommuterEmail(e.target.value)}
                        />
                    </div>
                 </div>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Badge ID</label>
                    <div className="relative">
                        <Shield className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="BADGE-000"
                            value={adminBadge}
                            onChange={(e) => setAdminBadge(e.target.value)}
                        />
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Secure Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                        <input 
                            type="password" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="••••••••"
                            value={adminPass}
                            onChange={(e) => setAdminPass(e.target.value)}
                        />
                    </div>
                 </div>
              </div>
            )}

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center animate-pulse">
                    {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all mt-6 ${activeTab === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'} ${loading ? 'opacity-70 cursor-wait' : ''}`}
            >
                {loading ? 'Authenticating...' : (
                    <>
                        Access System <ArrowRight size={18} />
                    </>
                )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;