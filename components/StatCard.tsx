import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'red' | 'yellow';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    red: 'bg-red-500/10 text-red-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
  };

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {subtext && <span className="text-xs font-medium text-slate-400 bg-slate-900 px-2 py-1 rounded-full">{subtext}</span>}
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white mb-1">{value}</h3>
        <p className="text-sm text-slate-400 font-medium">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;