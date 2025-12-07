import React from 'react';
import { LayoutDashboard, Map, Activity, Siren, Settings, LogOut, Network, User, Shield, CreditCard } from 'lucide-react';
import { Page, UserRole } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onToggleLogs: () => void;
  showLogs: boolean;
  userRole: UserRole;
  onToggleRole: () => void;
  isPro: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onToggleLogs, showLogs, userRole, onToggleRole, isPro }) => {
  
  // Define menu items based on role
  const adminItems = [
    { id: Page.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: Page.LIVE_MAP, label: 'Live Map', icon: Map },
    { id: Page.IOT_NETWORK, label: 'IoT Network', icon: Network },
    { id: Page.ANALYTICS, label: 'Analytics', icon: Activity },
    { id: Page.EMERGENCY, label: 'Emergency', icon: Siren },
  ];

  const commuterItems = [
    { id: Page.LIVE_MAP, label: 'Live Traffic Map', icon: Map },
    { id: Page.DASHBOARD, label: 'City Status', icon: LayoutDashboard },
    { id: Page.ANALYTICS, label: 'Commuter Trends', icon: Activity },
  ];

  const menuItems = userRole === 'ADMIN' ? adminItems : commuterItems;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${userRole === 'ADMIN' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <Activity className="text-white w-5 h-5" />
        </div>
        <div>
            <h1 className="text-xl font-bold text-white tracking-tight">ATMS {userRole === 'ADMIN' ? 'Pro' : 'Go'}</h1>
            <span className="text-xs text-slate-500 uppercase tracking-widest">{userRole} MODE</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              currentPage === item.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      
      {/* Subscription Banner for Free Commuters */}
      {userRole === 'COMMUTER' && (
          <div className="px-4 mb-4">
            <button 
                onClick={() => onNavigate(Page.SUBSCRIPTION)}
                className={`w-full p-4 rounded-2xl flex flex-col items-center text-center transition-all ${isPro ? 'bg-slate-800 border border-slate-700' : 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-orange-900/20'}`}
            >
                {isPro ? (
                    <>
                        <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                            <Shield size={16} /> Pro Active
                        </div>
                        <span className="text-xs text-slate-500">Manage Plan</span>
                    </>
                ) : (
                    <>
                        <CreditCard className="text-white mb-2" size={24} />
                        <span className="text-white font-bold">Upgrade to Pro</span>
                        <span className="text-yellow-100 text-xs mt-1">Unlock Predictive Traffic & Live Cams</span>
                    </>
                )}
            </button>
          </div>
      )}

      <div className="p-4 border-t border-slate-800">
        {userRole === 'ADMIN' && (
            <button 
                onClick={onToggleLogs}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-2 ${showLogs ? 'text-blue-400 bg-slate-800' : 'text-slate-400 hover:text-white'}`}
            >
            <Settings className="w-5 h-5" />
            <span>{showLogs ? 'Hide Logs' : 'System Logs'}</span>
            </button>
        )}
        <button 
            onClick={onToggleRole} 
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;