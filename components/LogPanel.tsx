import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal, XCircle } from 'lucide-react';

interface LogPanelProps {
  logs: LogEntry[];
  onClose: () => void;
}

const LogPanel: React.FC<LogPanelProps> = ({ logs, onClose }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="fixed bottom-0 left-64 right-0 h-48 bg-slate-950 border-t border-slate-800 z-40 flex flex-col font-mono text-sm shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal size={14} />
          <span className="font-semibold">System Stream / IoT Telemetry</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white">
          <XCircle size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
            <span className="text-slate-500">[{log.timestamp}]</span>
            <span className={`font-bold ${
                log.type === 'INFO' ? 'text-blue-400' : 
                log.type === 'WARN' ? 'text-yellow-400' : 
                log.type === 'ERROR' ? 'text-red-500' : 'text-green-400'
            }`}>
              [{log.source}]
            </span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogPanel;