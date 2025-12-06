import React from 'react';
import { Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import { AdAdvice } from '../types';

interface AdAdvisorProps {
  advice: AdAdvice | null;
  isLoading: boolean;
}

const AdAdvisor: React.FC<AdAdvisorProps> = ({ advice, isLoading }) => {
  if (!advice && !isLoading) return null;
  if (isLoading) {
    return (
        <div className="bg-[#0f1f1a] border border-emerald-900/30 p-6 rounded-3xl animate-pulse">
            <div className="h-4 bg-emerald-900/50 rounded w-1/3 mb-4"></div>
            <div className="space-y-2">
                <div className="h-3 bg-emerald-900/30 rounded w-full"></div>
                <div className="h-3 bg-emerald-900/30 rounded w-5/6"></div>
            </div>
        </div>
    )
  }

  if (!advice) return null;

  const isPowerful = advice.sentiment === 'powerful';
  const isGood = advice.sentiment === 'good';

  return (
    <div className={`relative overflow-hidden rounded-3xl border transition-all duration-500 ${isPowerful ? 'bg-gradient-to-br from-emerald-900/40 to-black border-emerald-500/50' : 'bg-[#0f1f1a] border-emerald-900/30'}`}>
      
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={100} className="text-emerald-400" />
      </div>

      <div className="p-6 relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-full ${isPowerful ? 'bg-emerald-500 text-black' : 'bg-emerald-900/50 text-emerald-400'}`}>
            <Lightbulb size={20} />
          </div>
          <div>
            <h3 className="font-bold text-emerald-100">Neomentes Advisor</h3>
            <p className="text-xs text-emerald-500/70 uppercase tracking-wider font-mono">Análisis en tiempo real</p>
          </div>
          <div className="ml-auto">
             <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">{advice.score}</span>
                <span className="text-xs text-gray-500">/100</span>
             </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6 overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${isPowerful ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : isGood ? 'bg-emerald-600' : 'bg-yellow-600'}`} 
                style={{ width: `${advice.score}%` }}
            ></div>
        </div>

        <div className="space-y-3">
          {advice.suggestions.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-3 text-sm text-gray-300 bg-black/20 p-3 rounded-xl border border-white/5">
               <TrendingUp className="flex-shrink-0 text-emerald-500 mt-0.5" size={14} />
               <span>{tip}</span>
            </div>
          ))}
        </div>

        {isPowerful && (
            <div className="mt-4 text-center">
                <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse">
                    ✨ ¡INPUTS EXCELENTES!
                </span>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdAdvisor;