import React from 'react';
import { Check, Star, Shield, Zap } from 'lucide-react';

interface SubscriptionProps {
  onUpgrade: () => void;
  isPro: boolean;
}

const Subscription: React.FC<SubscriptionProps> = ({ onUpgrade, isPro }) => {
  return (
    <div className="animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto py-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">Upgrade your Commute</h2>
        <p className="text-slate-400 max-w-2xl mx-auto">
            Get access to predictive traffic modeling, live camera feeds, and smart routing algorithms.
            Join thousands of daily commuters saving time with ATMS Pro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
        {/* Free Plan */}
        <div className="bg-slate-800 rounded-3xl p-8 border border-slate-700 flex flex-col relative overflow-hidden">
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white">Commuter Free</h3>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-white">$0</span>
                    <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm">Basic traffic monitoring for the casual traveler.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-slate-300">
                    <Check className="text-blue-500" size={20} /> Real-time Traffic Map
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                    <Check className="text-blue-500" size={20} /> Basic Incident Alerts
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                    <Check className="text-blue-500" size={20} /> AI Chat Assistant (Limited)
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                    <Check className="text-slate-700" size={20} /> Future Traffic Prediction
                </li>
                <li className="flex items-center gap-3 text-slate-500">
                    <Check className="text-slate-700" size={20} /> Live Camera Feeds
                </li>
            </ul>

            <button disabled className="w-full py-4 bg-slate-700 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                Current Plan
            </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-slate-800 rounded-3xl p-8 border border-yellow-500/50 flex flex-col relative overflow-hidden shadow-2xl shadow-yellow-500/10">
            <div className="absolute top-0 right-0 bg-yellow-500 text-slate-900 text-xs font-bold px-4 py-1 rounded-bl-xl">
                RECOMMENDED
            </div>
            
            <div className="mb-6">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    ATMS Pro <Star className="text-yellow-400 fill-yellow-400" size={20} />
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold text-white">$9.99</span>
                    <span className="text-slate-500">/month</span>
                </div>
                <p className="text-slate-400 mt-4 text-sm">Advanced tools for the power commuter.</p>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-white">
                    <div className="p-1 bg-yellow-500/20 rounded-full"><Zap className="text-yellow-400" size={14} /></div>
                    <span>Predictive Future Traffic (60m)</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                    <div className="p-1 bg-yellow-500/20 rounded-full"><Shield className="text-yellow-400" size={14} /></div>
                    <span>Live HD Camera Feeds</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                    <div className="p-1 bg-yellow-500/20 rounded-full"><Star className="text-yellow-400" size={14} /></div>
                    <span>Smart Route Alternatives</span>
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                    <Check className="text-yellow-500" size={20} /> All Free Features
                </li>
            </ul>

            <button 
                onClick={onUpgrade}
                disabled={isPro}
                className={`w-full py-4 font-bold rounded-xl transition-all ${
                    isPro 
                    ? 'bg-green-500 text-white cursor-default'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-[1.02] hover:shadow-lg'
                }`}
            >
                {isPro ? 'Plan Active' : 'Start 14-Day Free Trial'}
            </button>
            {!isPro && <p className="text-center text-xs text-slate-500 mt-4">Cancel anytime. No commitment.</p>}
        </div>
      </div>
    </div>
  );
};

export default Subscription;