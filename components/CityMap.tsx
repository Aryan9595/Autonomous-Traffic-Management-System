import React, { useMemo } from 'react';
import { Intersection, SignalState } from '../types';
import { ShieldAlert } from 'lucide-react';

interface CityMapProps {
  intersections: Intersection[];
  onSelect: (intersection: Intersection) => void;
  selectedId: string | null;
}

const CityMap: React.FC<CityMapProps> = ({ intersections, onSelect, selectedId }) => {
  // Define connections (roads) between intersection indexes
  // 0: Downtown, 1: Main (N), 2: Tech (E), 3: Ind (W), 4: Harbor (S), 5: Uni (NW)
  const roads = [
    { from: 0, to: 1 }, // Downtown <-> Main
    { from: 0, to: 2 }, // Downtown <-> Tech
    { from: 0, to: 3 }, // Downtown <-> Ind
    { from: 0, to: 4 }, // Downtown <-> Harbor
    { from: 3, to: 5 }, // Ind <-> Uni
    { from: 1, to: 5 }, // Main <-> Uni
  ];

  const getTrafficColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return '#ef4444'; // Red
      case 'HIGH': return '#f97316'; // Orange
      case 'MODERATE': return '#eab308'; // Yellow
      default: return '#3b82f6'; // Blue
    }
  };

  const projectedIntersections = useMemo(() => {
    if (intersections.length === 0) return [];

    const lats = intersections.map(i => i.coordinates.lat);
    const lngs = intersections.map(i => i.coordinates.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latSpan = (maxLat - minLat) || 0.01;
    const lngSpan = (maxLng - minLng) || 0.01;

    return intersections.map(int => {
      // Map to 10-90 range to keep within SVG
      const x = 10 + ((int.coordinates.lng - minLng) / lngSpan) * 80;
      // Invert Y because latitude goes up but SVG y goes down
      const y = 90 - ((int.coordinates.lat - minLat) / latSpan) * 80;
      
      return { ...int, x, y };
    });
  }, [intersections]);

  return (
    <div className="w-full h-full bg-slate-900 rounded-3xl overflow-hidden relative border border-slate-800 shadow-2xl">
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur p-3 rounded-xl border border-slate-700">
            <h3 className="text-white font-bold text-sm">Traffic Grid Live View</h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span> Low
                <span className="w-3 h-3 rounded-full bg-yellow-500"></span> Mod
                <span className="w-3 h-3 rounded-full bg-red-500"></span> High
            </div>
        </div>

      <svg width="100%" height="100%" viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {/* Grid Background */}
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* Roads */}
        {roads.map((road, i) => {
            const start = projectedIntersections[road.from];
            const end = projectedIntersections[road.to];
            
            if (!start || !end) return null;

            const isEmergencyRoute = start.isEmergencyOverride && end.isEmergencyOverride;

            return (
              <line
                key={i}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={isEmergencyRoute ? '#ef4444' : '#334155'}
                strokeWidth={isEmergencyRoute ? "2" : "1.5"}
                strokeDasharray={isEmergencyRoute ? "4" : "0"}
                className={isEmergencyRoute ? "animate-[dash_1s_linear_infinite]" : ""}
              />
            );
        })}

        {/* Intersections (Nodes) */}
        {projectedIntersections.map((int) => {
            const isSelected = selectedId === int.id;
            const signalColor = int.signalState === SignalState.RED ? '#ef4444' : int.signalState === SignalState.YELLOW ? '#eab308' : '#22c55e';
            
            return (
                <g 
                    key={int.id} 
                    onClick={() => onSelect(int)}
                    className="cursor-pointer transition-all duration-300 hover:opacity-80"
                >
                    {/* Outer Glow for Congestion */}
                    <circle 
                        cx={int.x} 
                        cy={int.y} 
                        r={isSelected ? "6" : "4"} 
                        fill={getTrafficColor(int.congestionLevel)}
                        opacity="0.3"
                        className={int.congestionLevel === 'CRITICAL' ? 'animate-ping' : ''}
                    />
                    
                    {/* Main Circle */}
                    <circle 
                        cx={int.x} 
                        cy={int.y} 
                        r={isSelected ? "3" : "2"} 
                        fill="#1e293b"
                        stroke={getTrafficColor(int.congestionLevel)}
                        strokeWidth="0.5"
                    />

                    {/* Signal Light Indicator */}
                    <circle 
                        cx={int.x + 1.5} 
                        cy={int.y - 1.5} 
                        r="0.8" 
                        fill={signalColor}
                    />

                    {/* Emergency Icon */}
                    {int.isEmergencyOverride && (
                        <foreignObject x={int.x - 3} y={int.y - 6} width="6" height="6">
                            <div className="flex justify-center">
                                <ShieldAlert size={4} className="text-red-500 fill-red-500 animate-bounce" />
                            </div>
                        </foreignObject>
                    )}

                    {/* Labels */}
                    {isSelected && (
                        <text 
                            x={int.x} 
                            y={int.y + 6} 
                            fontSize="3" 
                            fill="white" 
                            textAnchor="middle" 
                            className="pointer-events-none drop-shadow-md font-bold"
                        >
                            {int.name}
                        </text>
                    )}
                </g>
            );
        })}
      </svg>
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
};

export default CityMap;