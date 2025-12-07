import React, { useState, useEffect } from 'react';
import { Intersection, Incident } from '../types';
import WorldMap from '../components/WorldMap';
import { Siren, ShieldAlert, Ambulance, Flame, AlertTriangle, Car, Timer, CheckCircle, XCircle } from 'lucide-react';

interface EmergencyProps {
  intersections: Intersection[];
  onEmergencyToggle: (id: string) => void;
}

// Mock incidents generator
const MOCK_INCIDENTS: Incident[] = [
    { id: 'INC-9921', type: 'ACCIDENT', location: 'Market St & Van Ness', intersectionId: 'INT-1', timestamp: '10:42 AM', status: 'ACTIVE', unitsResponding: 3, eta: 4 },
    { id: 'INC-9924', type: 'MEDICAL', location: 'Mission St & 16th', intersectionId: 'INT-2', timestamp: '10:45 AM', status: 'DISPATCHED', unitsResponding: 1, eta: 8 },
];

const Emergency: React.FC<EmergencyProps> = ({ intersections, onEmergencyToggle }) => {
  const activeEmergencies = intersections.filter(i => i.isEmergencyOverride).length;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);

  const getIcon = (type: Incident['type']) => {
      switch(type) {
          case 'MEDICAL': return <Ambulance className="text-red-400" size={18} />;
          case 'FIRE': return <Flame className="text-orange-400" size={18} />;
          case 'ACCIDENT': return <Car className="text-yellow-400" size={18} />;
          default: return <AlertTriangle className="text-slate-400" size={18} />;
      }
  };

  const handleDetailsClick = (intersectionId: string) => {
      setSelectedId(intersectionId);
      // Logic to focus map handled by passing selectedId to WorldMap
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute -left-10 top-0 bottom-0 w-2 bg-red-500 animate-pulse" />
        <div className="flex items-center gap-4 z-10">
            <div className="p-4 bg-red-600 rounded-xl shadow-lg shadow-red-600/20">
                <Siren className="w-8 h-8 text-white animate-spin-slow" />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Emergency Response Center</h2>
                <p className="text-slate-400">Manage active incidents and signal overrides.</p>
            </div>
        </div>
        <div className="flex items-center gap-8 z-10">
             <div className="text-center">
                <div className="text-4xl font-black text-white">{activeEmergencies}</div>
                <div className="text-xs uppercase tracking-wider text-red-400 font-bold">Overrides Active</div>
             </div>
             <div className="text-center border-l border-red-500/30 pl-8">
                <div className="text-4xl font-black text-white">{incidents.length}</div>
                <div className="text-xs uppercase tracking-wider text-yellow-400 font-bold">Open Incidents</div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Map View */}
          <div className="lg:col-span-2 h-full rounded-2xl overflow-hidden border border-slate-700 relative">
            <WorldMap 
                intersections={intersections} 
                onSelect={(i) => setSelectedId(i.id)} 
                selectedId={selectedId} 
            />
            {/* Overlay instructions */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700 text-xs text-slate-300 z-[500]">
                Select a node to view override options
            </div>
          </div>

          {/* Incident Feed & Controls */}
          <div className="flex flex-col gap-4 h-full">
              
              {/* Active Incident List */}
              <div className="flex-1 bg-slate-800 rounded-2xl border border-slate-700 p-4 overflow-y-auto">
                 <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-red-400" />
                    Live Incidents
                 </h3>
                 <div className="space-y-3">
                    {incidents.map(inc => {
                        const intersection = intersections.find(i => i.id === inc.intersectionId);
                        const isOverrideActive = intersection?.isEmergencyOverride || false;

                        return (
                        <div key={inc.id} className={`p-3 rounded-xl border transition-all ${isOverrideActive ? 'bg-red-900/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'bg-slate-900/50 border-slate-700'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 font-bold text-slate-200">
                                    {getIcon(inc.type)}
                                    <span>{inc.type}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${isOverrideActive ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                                    {isOverrideActive ? 'PRIORITY' : inc.status}
                                </span>
                            </div>
                            <p className="text-sm text-slate-300 mb-2">{inc.location}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Timer size={12} /> ETA: {inc.eta}m
                                </div>
                                <div>Units: {inc.unitsResponding}</div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <button 
                                    onClick={() => onEmergencyToggle(inc.intersectionId)}
                                    className={`flex-1 py-2 rounded text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                                        isOverrideActive 
                                        ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-500' 
                                        : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/50'
                                    }`}
                                >
                                    {isOverrideActive ? (
                                        <><XCircle size={14} /> Close Route</>
                                    ) : (
                                        <><Siren size={14} /> Open Route</>
                                    )}
                                </button>
                                <button 
                                    onClick={() => handleDetailsClick(inc.intersectionId)}
                                    className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-xs font-bold transition-colors"
                                >
                                    Details
                                </button>
                            </div>
                        </div>
                    )})}
                 </div>
              </div>

              {/* Quick Override List */}
              <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 h-1/3 overflow-y-auto">
                 <h3 className="text-white font-bold mb-2 text-sm uppercase tracking-wide text-slate-400">Manual Override Controls</h3>
                 <div className="space-y-2">
                    {intersections.map(i => (
                        <div key={i.id} className="flex justify-between items-center p-2 rounded bg-slate-900/30 border border-slate-800 hover:border-slate-600 transition-colors">
                            <span className={`text-xs font-semibold ${i.isEmergencyOverride ? 'text-red-400' : 'text-slate-400'}`}>
                                {i.name}
                            </span>
                            <button 
                                onClick={() => onEmergencyToggle(i.id)}
                                className={`w-10 h-5 rounded-full transition-colors relative ${i.isEmergencyOverride ? 'bg-red-500' : 'bg-slate-700'}`}
                                title={i.isEmergencyOverride ? "Disable Override" : "Enable Override"}
                            >
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${i.isEmergencyOverride ? 'left-6' : 'left-1'}`} />
                            </button>
                        </div>
                    ))}
                 </div>
              </div>
          </div>
      </div>
    </div>
  );
};

export default Emergency;