import React, { useState, useEffect } from 'react';
import { Intersection, UserRole } from '../types';
import WorldMap from '../components/WorldMap';
import IntersectionCard from '../components/IntersectionCard';
import { MousePointer2, Navigation, Clock, Lock, HeartPulse, AlertTriangle, X, MessageSquarePlus, Check, Bell } from 'lucide-react';

interface LiveMapProps {
  intersections: Intersection[];
  onEmergencyToggle: (id: string) => void;
  userRole: UserRole;
  isPro: boolean;
  onUpgrade: () => void;
  onMedicalSignal: () => void;
}

const LiveMap: React.FC<LiveMapProps> = ({ intersections, onEmergencyToggle, userRole, isPro, onUpgrade, onMedicalSignal }) => {
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);
  const [predictionOffset, setPredictionOffset] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  
  // Incident Reporting
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  
  // Incident Feed Sidebar
  const [showIncidentFeed, setShowIncidentFeed] = useState(false);
  const [activeIncidents, setActiveIncidents] = useState<{id: string, name: string, type: string, time: string, intersectionId?: string}[]>([]);

  // Update selected intersection when data changes
  const activeData = selectedIntersection 
    ? intersections.find(i => i.id === selectedIntersection.id) || null
    : null;

  // Auto-detect accident simulation (Populates the Feed, NO POPUP)
  useEffect(() => {
    const critical = intersections.find(i => i.congestionLevel === 'CRITICAL' || i.isEmergencyOverride);
    
    // Only report if unique (simple duplication check)
    if (critical && Math.random() > 0.8) { 
        setActiveIncidents(prev => {
            if (prev.find(inc => inc.name === critical.name)) return prev;
            return [{
                id: Date.now().toString(),
                name: critical.name,
                type: critical.isEmergencyOverride ? 'Emergency Route' : 'Congestion/Accident',
                time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                intersectionId: critical.id
            }, ...prev];
        });
    }
  }, [intersections]);

  const handleSOS = () => {
      setSosActive(true);
      onMedicalSignal();
      // Auto dismiss after 5 seconds
      setTimeout(() => setSosActive(false), 5000);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setReportSuccess(true);
      // Add user report to local feed immediately
      setActiveIncidents(prev => [{
          id: Date.now().toString(),
          name: "Current Location",
          type: "User Reported Hazard",
          time: "Just Now"
      }, ...prev]);

      setTimeout(() => {
          setReportSuccess(false);
          setShowReportModal(false);
      }, 2000);
  };

  const handleIncidentClick = (intersectionId?: string) => {
      if (intersectionId) {
          const target = intersections.find(i => i.id === intersectionId);
          if (target) {
              setSelectedIntersection(target);
          }
      }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 relative">
      
      {/* Report Incident Modal */}
      {showReportModal && (
          <div className="absolute inset-0 z-[1100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                  {reportSuccess ? (
                      <div className="text-center py-8">
                          <div className="inline-flex p-4 bg-green-500/20 rounded-full mb-4">
                            <Check size={48} className="text-green-500" />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
                          <p className="text-slate-400">Thanks for making the roads safer!</p>
                      </div>
                  ) : (
                      <>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white">Report Incident</h3>
                            <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-white"><X size={20}/></button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button type="button" className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-sm font-semibold transition-colors">Accident</button>
                                <button type="button" className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-sm font-semibold transition-colors">Hazard/Pothole</button>
                                <button type="button" className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-sm font-semibold transition-colors">Traffic Jam</button>
                                <button type="button" className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-200 text-sm font-semibold transition-colors">Police</button>
                            </div>
                            <textarea 
                                placeholder="Additional details (optional)..."
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-slate-200 text-sm focus:outline-none focus:border-blue-500"
                                rows={3}
                            ></textarea>
                            <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors">
                                Submit Report
                            </button>
                        </form>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* Map Area */}
      <div className="flex-1 min-h-[400px] flex flex-col relative">
        <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-700">
            <WorldMap 
                intersections={intersections} 
                onSelect={setSelectedIntersection} 
                selectedId={activeData?.id || null}
                predictionMode={predictionOffset > 0}
                predictionOffset={predictionOffset}
            />
            
            {/* Top Right Controls */}
            <div className="absolute top-4 right-4 z-[500] flex gap-2">
                 {/* Incident Feed Toggle */}
                 <button 
                    onClick={() => setShowIncidentFeed(!showIncidentFeed)}
                    className="bg-slate-800 text-white p-3 rounded-full shadow-lg border border-slate-600 hover:bg-slate-700 relative"
                 >
                    <Bell size={20} />
                    {activeIncidents.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-slate-900">
                            {activeIncidents.length}
                        </span>
                    )}
                 </button>
            </div>

            {/* Incident Feed Drawer */}
            {showIncidentFeed && (
                <div className="absolute top-16 right-4 w-72 max-h-[400px] bg-slate-900/95 backdrop-blur border border-slate-700 rounded-2xl shadow-2xl z-[500] overflow-hidden flex flex-col animate-in slide-in-from-right-10 duration-200">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <AlertTriangle size={16} className="text-yellow-400" /> Live Incidents
                        </h4>
                        <button onClick={() => setShowIncidentFeed(false)} className="text-slate-500 hover:text-white"><X size={16}/></button>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                        {activeIncidents.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                No active incidents reported nearby.
                            </div>
                        ) : (
                            activeIncidents.map(inc => (
                                <div 
                                    key={inc.id} 
                                    onClick={() => handleIncidentClick(inc.intersectionId)}
                                    className={`bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer ${inc.intersectionId ? 'hover:border-blue-500/50' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-red-400 font-bold text-xs uppercase bg-red-950/30 px-2 py-0.5 rounded">{inc.type}</span>
                                        <span className="text-slate-500 text-[10px]">{inc.time}</span>
                                    </div>
                                    <div className="text-slate-200 font-semibold text-sm">{inc.name}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Commuter Buttons: SOS & Report */}
            {userRole === 'COMMUTER' && (
                <div className="absolute top-6 left-6 z-[500] flex flex-col gap-3">
                    {/* SOS Button */}
                    {sosActive ? (
                        <div className="bg-green-500 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in">
                            <CheckCircleIcon className="w-6 h-6" />
                            <div>
                                <div className="font-bold">Signal Sent!</div>
                                <div className="text-xs">Ambulance dispatched.</div>
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={handleSOS}
                            className="group bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full shadow-lg shadow-red-900/50 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="relative">
                                <HeartPulse className="w-6 h-6 animate-pulse" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                            </div>
                            <span className="font-bold">MEDICAL SOS</span>
                        </button>
                    )}

                    {/* Report Incident Button */}
                    <button 
                        onClick={() => setShowReportModal(true)}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full shadow-lg border border-slate-600 flex items-center gap-3 transition-all hover:scale-105"
                    >
                        <MessageSquarePlus className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold text-sm">Report Incident</span>
                    </button>
                </div>
            )}
        </div>
        
        {/* Pro Feature: Time Slider */}
        {userRole === 'COMMUTER' && (
            <div className="bg-slate-800 border-t border-slate-700 p-4 flex items-center gap-4 rounded-b-xl">
                <div className="flex items-center gap-2 text-slate-300 min-w-[150px]">
                    <Clock size={18} className={isPro ? "text-blue-400" : "text-slate-500"} />
                    <span className="font-semibold text-sm">Future Traffic</span>
                    {!isPro && <Lock size={14} className="text-yellow-500" />}
                </div>
                
                <div className="flex-1 relative flex items-center">
                    {!isPro && (
                        <div 
                            onClick={onUpgrade}
                            className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex items-center justify-center cursor-pointer rounded-lg border border-yellow-500/30 hover:bg-slate-900/40 transition-all"
                        >
                            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider">Upgrade to Pro to view Forecasts</span>
                        </div>
                    )}
                    <input 
                        type="range" 
                        min="0" 
                        max="60" 
                        step="15"
                        value={predictionOffset}
                        onChange={(e) => setPredictionOffset(Number(e.target.value))}
                        disabled={!isPro}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-50"
                    />
                </div>
                <div className="text-white font-mono w-16 text-right">
                    +{predictionOffset}m
                </div>
            </div>
        )}
      </div>

      {/* Sidebar Details */}
      <div className="w-full lg:w-96 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {userRole === 'ADMIN' ? <MousePointer2 className="w-5 h-5 text-blue-400" /> : <Navigation className="w-5 h-5 text-emerald-400" />}
            {userRole === 'ADMIN' ? 'Control Panel' : 'Location Details'}
        </h2>
        
        {activeData ? (
            <div className="animate-in slide-in-from-right duration-300 space-y-4">
                <IntersectionCard 
                    data={activeData} 
                    onEmergencyToggle={onEmergencyToggle} 
                    isPro={isPro}
                    onUpgrade={onUpgrade}
                />
                
                {/* Commuter Specific Info */}
                {userRole === 'COMMUTER' && (
                    <div className="bg-emerald-900/20 p-4 rounded-xl border border-emerald-500/30">
                        <h4 className="text-emerald-400 font-semibold mb-2">Travel Advice</h4>
                        <p className="text-sm text-slate-300">
                           Traffic flow is {activeData.congestionLevel.toLowerCase()}. 
                           {activeData.congestionLevel === 'CRITICAL' ? ' Avoid this intersection if possible.' : ' Good time to travel through here.'}
                        </p>
                    </div>
                )}
            </div>
        ) : (
            <div className="flex-1 bg-slate-800/50 border border-slate-800 border-dashed rounded-xl flex items-center justify-center text-slate-500 text-center p-6">
                <div>
                    <MapIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a marker on the map to view details.</p>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const MapIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
)

const CheckCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)

export default LiveMap;