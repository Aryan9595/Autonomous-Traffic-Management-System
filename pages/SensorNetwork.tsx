import React, { useState } from 'react';
import { IoTDevice } from '../types';
import { Wifi, Battery, AlertCircle, RefreshCw, Server, Video, Podcast, Download } from 'lucide-react';

interface SensorNetworkProps {
  devices: IoTDevice[];
  onReboot: (id: string) => void;
}

const SensorNetwork: React.FC<SensorNetworkProps> = ({ devices, onReboot }) => {
  const onlineCount = devices.filter(d => d.status === 'ONLINE').length;
  const offlineCount = devices.filter(d => d.status === 'OFFLINE').length;
  const [updating, setUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  const getIcon = (type: IoTDevice['type']) => {
    switch (type) {
        case 'CAMERA': return <Video size={18} />;
        case 'INDUCTIVE_LOOP': return <Podcast size={18} />;
        case 'ENV_SENSOR': return <Server size={18} />;
        case 'CONTROLLER': return <Wifi size={18} />;
        default: return <Server size={18} />;
    }
  };

  const handleFirmwareUpdate = () => {
      setUpdating(true);
      setUpdateProgress(0);
      const interval = setInterval(() => {
          setUpdateProgress(prev => {
              if (prev >= 100) {
                  clearInterval(interval);
                  setTimeout(() => setUpdating(false), 1000);
                  return 100;
              }
              return prev + 5;
          });
      }, 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-white">IoT Sensor Network</h2>
            <p className="text-slate-400">Manage physical infrastructure and sensor telemetry.</p>
        </div>
        
        {/* Bulk Actions */}
        <div className="flex items-center gap-4">
             {updating ? (
                 <div className="bg-slate-800 px-4 py-2 rounded-lg border border-blue-500/30 flex items-center gap-3">
                     <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 transition-all duration-100" style={{ width: `${updateProgress}%` }}></div>
                     </div>
                     <span className="text-xs text-blue-400 font-mono">{updateProgress}%</span>
                 </div>
             ) : (
                 <button onClick={handleFirmwareUpdate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-semibold text-sm transition-colors">
                    <Download size={16} /> Broadcast Update
                 </button>
             )}

             <div className="flex gap-2">
                <div className="bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20 text-green-400 font-bold text-sm">
                    {onlineCount} Online
                </div>
                <div className="bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 text-red-400 font-bold text-sm">
                    {offlineCount} Offline
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {devices.map((device) => (
            <div key={device.id} className={`p-4 rounded-xl border ${device.status === 'ONLINE' ? 'bg-slate-800 border-slate-700' : 'bg-red-950/20 border-red-900/50'} relative group`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2 text-slate-300 font-semibold">
                        {getIcon(device.type)}
                        <span className="text-sm">{device.type}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${device.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
                </div>
                
                <h3 className="text-white text-sm font-mono mb-4 truncate" title={device.id}>{device.id}</h3>
                
                <div className="space-y-2 text-xs text-slate-400 mb-4">
                    <div className="flex justify-between">
                        <span>Latency</span>
                        <span className={device.latency > 100 ? 'text-yellow-400' : 'text-slate-200'}>{device.latency} ms</span>
                    </div>
                    {device.batteryLevel !== undefined && (
                        <div className="flex justify-between items-center">
                            <span>Battery</span>
                            <div className="flex items-center gap-1">
                                <Battery size={12} className={device.batteryLevel < 20 ? 'text-red-500' : 'text-green-400'} />
                                <span>{device.batteryLevel}%</span>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span>Last Ping</span>
                        <span>{new Date(device.lastPing).toLocaleTimeString()}</span>
                    </div>
                </div>

                <button 
                    onClick={() => onReboot(device.id)}
                    className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors"
                >
                    <RefreshCw size={12} /> Reboot Device
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SensorNetwork;