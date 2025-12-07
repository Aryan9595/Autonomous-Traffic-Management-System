import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, Send, X, Bot, Sparkles, User, MapPin, AlertTriangle, Clock } from 'lucide-react';
import { TrafficStats, Intersection, ChatMessage, UserRole } from '../types';

interface AICopilotProps {
  stats: TrafficStats;
  intersections: Intersection[];
  userRole: UserRole;
  userName?: string;
}

const AICopilot: React.FC<AICopilotProps> = ({ stats, intersections, userRole, userName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const adminSuggestions = [
      "Show critical intersections",
      "Draft incident report",
      "Optimize signal timing",
      "System health check"
  ];

  const commuterSuggestions = [
      "Fastest route home?",
      "Current traffic in London?",
      "Any accidents nearby?",
      "Forecast for 5 PM"
  ];

  const suggestions = userRole === 'ADMIN' ? adminSuggestions : commuterSuggestions;

  // Reset chat when role changes
  useEffect(() => {
    setMessages([{ 
        role: 'model', 
        text: userRole === 'ADMIN' 
        ? `Officer ${userName || 'Admin'}, I am online. Ready to assist with traffic control and global monitoring.` 
        : `Hello ${userName || 'Traveler'}! I can help you find the best routes and avoid traffic.` 
    }]);
  }, [userRole, userName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const messageToSend = textOverride || input;
    if (!messageToSend.trim() || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Construct context for the AI
      const context = `
        You are an advanced Traffic AI Assistant embedded in the ATMS (Autonomous Traffic Management System).
        The current user is a: ${userRole} named ${userName}. 
        ${userRole === 'COMMUTER' ? 'Focus on travel time, safety, and route advice. Be friendly and helpful.' : 'Focus on system health, congestion management, and emergency overrides. Be professional and concise.'}

        Current Global System Stats:
        - Total Cars Monitored: ${stats.totalCars}
        - Avg Congestion: ${stats.averageCongestion}%
        - Active Alerts: ${stats.activeAlerts}

        Sample Intersection Status:
        ${intersections.slice(0, 5).map(i => `- ${i.name} (${i.location}): ${i.congestionLevel} Congestion`).join('\n')}

        User Question: ${messageToSend}
        
        Keep answers short (under 50 words) unless asked for a report.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: context,
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || "I couldn't process that request." }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to AI Network. Please check API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : userRole === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
      >
        <MessageSquare className="w-8 h-8 text-white" />
      </button>

      {/* Chat Window */}
      <div className={`fixed bottom-6 right-6 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 h-[600px]' : 'scale-0 opacity-0 h-0 overflow-hidden'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700 bg-slate-800 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${userRole === 'ADMIN' ? 'bg-blue-500/20' : 'bg-emerald-500/20'}`}>
                    <Bot className={`w-5 h-5 ${userRole === 'ADMIN' ? 'text-blue-400' : 'text-emerald-400'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-white">Traffic {userRole === 'ADMIN' ? 'Copilot' : 'Guide'}</h3>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Online
                    </div>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
            </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                        msg.role === 'user' 
                            ? (userRole === 'ADMIN' ? 'bg-blue-600' : 'bg-emerald-600') + ' text-white rounded-br-none' 
                            : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}>
                        {msg.role === 'model' && <Sparkles size={12} className="text-purple-400 mb-1" />}
                        {msg.text}
                    </div>
                </div>
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none border border-slate-700 flex gap-1">
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-200"></span>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
            {suggestions.map((s, i) => (
                <button 
                    key={i}
                    onClick={() => handleSend(s)}
                    className="whitespace-nowrap px-3 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                    {s}
                </button>
            ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={userRole === 'ADMIN' ? "Query system status..." : "Ask for route advice..."}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button 
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className={`p-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${userRole === 'ADMIN' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
                >
                    <Send size={20} className="text-white" />
                </button>
            </div>
        </div>
      </div>
    </>
  );
};

export default AICopilot;