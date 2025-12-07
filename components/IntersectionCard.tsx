import React from 'react';
import { Intersection, SignalState } from '../types';
import { Car, AlertTriangle, ShieldAlert, Cloud, Wifi, Wind, Lock, Gauge } from 'lucide-react';

interface IntersectionCardProps {
  data: Intersection;
  onEmergencyToggle: (id: string) => void;
  isPro?: boolean;
  onUpgrade?: () => void;
}

const IntersectionCard: React.FC<IntersectionCardProps> = ({ data, onEmergencyToggle, isPro = true, onUpgrade }) => {
  const congestionColor = {
    LOW: 'text-green-400',
    MODERATE: 'text-yellow-400',
    HIGH: 'text-orange-400',
    CRITICAL: 'text-red-500'
  };

  const signalColor = {
    [SignalState.RED]: 'bg-red-500 shadow-red-500/50',
    [SignalState.YELLOW]: 'bg-yellow-400 shadow-yellow-400/50',
    [SignalState.GREEN]: 'bg-green-500 shadow-green-500/50',
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${data.isEmergencyOverride ? 'border-red-500 bg-red-950/20' : 'border-slate-700 bg-slate-800'} transition-all group`}>
      {data.isEmergencyOverride && (
        <div className="absolute top-0 right-0 bg-red-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold animate-pulse flex items-center gap-1 z-20">
          <ShieldAlert size={12} /> OVERRIDE
        </div>
      )}
      
      {/* Top Section: Camera Feed */}
      <div className="h-40 bg-slate-900 relative overflow-hidden">
        <img 
            src={data.cameraUrl} 
            alt="Traffic Feed" 
            className={`w-full h-full object-cover transition-opacity ${isPro ? 'opacity-80' : 'opacity-30 blur-md'}`}
        />
        
        {/* Pro Lock Overlay */}
        {!isPro && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/40 z-10">
                <div className="p-3 bg-slate-800/80 rounded-full mb-2">
                    <Lock size={20} className="text-yellow-500" />
                </div>
                <button 
                    onClick={onUpgrade} 
                    className="text-xs font-bold bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-full hover:bg-yellow-400 transition-colors"
                >
                    Unlock Live Feed
                </button>
            </div>
        )}

        {isPro && (
            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-mono text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                LIVE
            </div>
        )}
        
        {/* Environmental Overlay */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
             <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                <Cloud size={10} /> {data.environment.weather}
             </div>
             <div className="bg-black/50 backdrop-blur px-2 py-1 rounded text-xs text-white flex items-center gap-1">
                <Wind size={10} /> {data.environment.co2Level} PPM
             </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
             <div className="bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-full ${signalColor[data.signalState]} shadow-lg transition-colors duration-300`}></div>
                    <span className="text-xl font-bold font-mono text-white min-w-[30px]">{data.signalTimer}s</span>
                </div>
             </div>
             
             <div className="bg-slate-900/80 backdrop-blur px-2 py-1 rounded border border-slate-700 text-xs text-slate-400 flex items-center gap-1">
                <Wifi size={10} className="text-green-400" />
                IoT Active
             </div>
        </div>
      </div>

      {/* Bottom Section: Stats */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-lg truncate mb-1">{data.name}</h3>
        <p className="text-xs text-slate-400 mb-4 font-mono">{data.location}</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-700/50 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <Car size={12} />
                    <span>Flow Rate</span>
                </div>
                <div className="text-white font-semibold">{data.currentFlow} <span className="text-xs text-slate-500">v/m</span></div>
            </div>
            <div className="bg-slate-700/50 p-2 rounded-lg">
                <div className="flex items-center gap-1 text-slate-400 text-xs mb-1">
                    <AlertTriangle size={12} />
                    <span>Density</span>
                </div>
                <div className={`font-semibold ${congestionColor[data.congestionLevel]}`}>{data.congestionLevel}</div>
            </div>
        </div>
        
        {/* Green Wave Advisor (Smart City Feature) */}
        {!data.isEmergencyOverride && (
            <div className="bg-emerald-900/20 border border-emerald-500/20 p-2 rounded-lg mb-4 flex items-center gap-3">
                <div className="bg-emerald-500/20 p-2 rounded-full">
                    <Gauge size={16} className="text-emerald-400" />
                </div>
                <div>
                    <div className="text-xs text-emerald-300 font-bold uppercase tracking-wide">Green Wave Advisor</div>
                    <div className="text-xs text-slate-400">Maintain <span className="text-white font-bold">45 km/h</span> to catch green light.</div>
                </div>
            </div>
        )}
        
        {/* Only allow toggle if user has rights, otherwise show status */}
        <button 
            onClick={() => onEmergencyToggle(data.id)}
            disabled={!isPro && !data.isEmergencyOverride} // Just simulate disable for non-admins usually, but for this demo card props might vary
            className={`w-full py-2 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                data.isEmergencyOverride 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white'
            }`}
        >
            {data.isEmergencyOverride ? 'Normalize Traffic' : 'Emergency Priority'}
        </button>
      </div>
    </div>
  );
};

export default IntersectionCard;