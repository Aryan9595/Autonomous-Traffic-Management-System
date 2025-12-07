import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Emergency from './pages/Emergency';
import SensorNetwork from './pages/SensorNetwork';
import LiveMap from './pages/LiveMap';
import Subscription from './pages/Subscription';
import Login from './pages/Login';
import AICopilot from './components/AICopilot';
import LogPanel from './components/LogPanel';
import { Page, Intersection, TrafficStats, ChartDataPoint, IoTDevice, LogEntry, UserRole, ZoneMode } from './types';
import { generateInitialIntersections, generateIoTDevices, updateSimulation, calculateStats, generateChartData } from './services/dataService';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('COMMUTER');
  const [userName, setUserName] = useState('');
  
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);
  
  // Pro Subscription State
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [zoneMode, setZoneMode] = useState<ZoneMode>('NORMAL');
  const [stats, setStats] = useState<TrafficStats>({ totalCars: 0, averageCongestion: 0, activeAlerts: 0, systemHealth: 100, avgCo2: 400, zoneMode: 'NORMAL' });
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(true);

  // Derived Pro State
  const isEffectivePro = userRole === 'ADMIN' || isSubscriptionActive;

  // Initialize Data
  useEffect(() => {
    const initIntersections = generateInitialIntersections();
    setIntersections(initIntersections);
    setDevices(generateIoTDevices(initIntersections));
    setChartData(generateChartData());
    setLogs([{
        id: 'init',
        timestamp: new Date().toLocaleTimeString(),
        source: 'SYSTEM',
        message: 'ATMS Core Initialized. Connecting to Sensor Network...',
        type: 'INFO'
    }]);
  }, []);

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Run Simulation Step with Zone Mode
      const result = updateSimulation(intersections, devices, zoneMode);
      
      setIntersections(result.intersections);
      setDevices(result.devices);
      
      if (result.logs.length > 0) {
        setLogs(prev => [...prev.slice(-49), ...result.logs]);
      }

      setStats(calculateStats(result.intersections, zoneMode));

      setChartData(prev => {
        const last = prev[prev.length - 1];
        if (!last) return prev;
        const newPoint = {
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            congestion: Math.max(10, Math.min(90, last.congestion + (Math.random() * 10 - 5))),
            prediction: Math.max(10, Math.min(90, last.prediction + (Math.random() * 10 - 5))),
        };
        return [...prev.slice(1), newPoint];
      });

    }, 2000); 

    return () => clearInterval(interval);
  }, [intersections, devices, zoneMode]);

  const handleLogin = (role: UserRole, name: string) => {
    setUserRole(role);
    setUserName(name);
    setIsAuthenticated(true);
    setCurrentPage(role === 'ADMIN' ? Page.DASHBOARD : Page.LIVE_MAP);
    setShowLogs(role === 'ADMIN');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('COMMUTER');
    setUserName('');
    setCurrentPage(Page.LOGIN);
  };

  const handleEmergencyToggle = (id: string) => {
    if (userRole !== 'ADMIN') return;

    setIntersections(prev => prev.map(i => {
      if (i.id === id) {
        const newState = !i.isEmergencyOverride;
        setLogs(l => [...l, {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            source: 'USER_ACTION',
            message: `Emergency Override ${newState ? 'ENABLED' : 'DISABLED'} for ${i.name}`,
            type: newState ? 'WARN' : 'INFO'
        }]);
        return { ...i, isEmergencyOverride: newState };
      }
      return i;
    }));
  };

  const handleZoneAction = (mode: ZoneMode) => {
      setZoneMode(mode);
      setLogs(l => [...l, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: 'ADMIN_PROTOCOL',
        message: `ZONE MODE SWITCHED TO: ${mode}`,
        type: 'WARN'
    }]);
  };

  const handleRebootDevice = (id: string) => {
    setLogs(l => [...l, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: 'ADMIN',
        message: `Initiating Reboot Sequence for ${id}...`,
        type: 'INFO'
    }]);
    
    setTimeout(() => {
        setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'ONLINE', latency: 20 } : d));
        setLogs(l => [...l, {
            id: Date.now().toString(),
            timestamp: new Date().toLocaleTimeString(),
            source: 'IOT_NETWORK',
            message: `Device ${id} successfully rebooted and online.`,
            type: 'SUCCESS'
        }]);
    }, 1500);
  };

  const handleMedicalSignal = () => {
      setLogs(l => [...l, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: 'MEDICAL_SOS',
        message: `Medical Distress Signal received from user ${userName || 'Unknown'}. Closest Hospital: City General (1.2mi).`,
        type: 'WARN'
    }]);
  };

  const toggleRole = () => {
     handleLogout();
  };

  const handleUpgrade = () => {
      setIsSubscriptionActive(true);
      setLogs(l => [...l, {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        source: 'SUBSCRIPTION',
        message: `User ${userName} upgraded to PRO Plan.`,
        type: 'SUCCESS'
    }]);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return (
          <Dashboard 
            stats={stats} 
            intersections={intersections} 
            onEmergencyToggle={handleEmergencyToggle} 
            chartData={chartData}
            onZoneAction={handleZoneAction}
            currentZoneMode={zoneMode}
          />
        );
      case Page.LIVE_MAP:
        return (
          <LiveMap 
            intersections={intersections} 
            onEmergencyToggle={handleEmergencyToggle} 
            userRole={userRole}
            isPro={isEffectivePro}
            onUpgrade={() => setCurrentPage(Page.SUBSCRIPTION)}
            onMedicalSignal={handleMedicalSignal}
          />
        );
      case Page.IOT_NETWORK:
        if (userRole !== 'ADMIN') return <LiveMap intersections={intersections} onEmergencyToggle={handleEmergencyToggle} userRole={userRole} isPro={isEffectivePro} onUpgrade={() => setCurrentPage(Page.SUBSCRIPTION)} onMedicalSignal={handleMedicalSignal} />;
        return (
          <SensorNetwork devices={devices} onReboot={handleRebootDevice} />
        );
      case Page.EMERGENCY:
        if (userRole !== 'ADMIN') return <LiveMap intersections={intersections} onEmergencyToggle={handleEmergencyToggle} userRole={userRole} isPro={isEffectivePro} onUpgrade={() => setCurrentPage(Page.SUBSCRIPTION)} onMedicalSignal={handleMedicalSignal} />;
        return (
          <Emergency intersections={intersections} onEmergencyToggle={handleEmergencyToggle} />
        );
      case Page.SUBSCRIPTION:
        return (
          <Subscription onUpgrade={handleUpgrade} isPro={isSubscriptionActive} />
        );
      case Page.ANALYTICS:
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-2xl font-bold text-white">
                    {userRole === 'ADMIN' ? 'Historical Analytics' : 'Traffic Trends'}
                </h2>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6">Traffic Volume Analysis (Last 24h)</h3>
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="time" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Legend />
                                <Bar dataKey="congestion" name="Density Index" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="prediction" name={userRole === 'ADMIN' ? "AI Model Accuracy" : "Forecast"} fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row overflow-hidden">
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
        userRole={userRole}
        onToggleRole={toggleRole}
        isPro={isSubscriptionActive}
      />
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen relative">
        {zoneMode === 'LOCKDOWN' && (
            <div className="absolute top-0 left-0 right-0 z-[100] bg-red-600/90 text-white p-2 text-center font-bold animate-pulse">
                SYSTEM LOCKDOWN PROTOCOL ACTIVE
            </div>
        )}
        <div className="max-w-7xl mx-auto pb-48">
           {renderContent()}
        </div>
        <AICopilot stats={stats} intersections={intersections} userRole={userRole} userName={userName} />
        {showLogs && userRole === 'ADMIN' && <LogPanel logs={logs} onClose={() => setShowLogs(false)} />}
      </main>
    </div>
  );
};

export default App;