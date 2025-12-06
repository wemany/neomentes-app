import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, X, MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';
import { AdAdvice } from '../types';

interface MarketingAssistantProps {
  advice: AdAdvice | null;
  isLoading: boolean;
  onApplySuggestion: (text: string) => void;
}

const MarketingAssistant: React.FC<MarketingAssistantProps> = ({ advice, isLoading, onApplySuggestion }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasNewAdvice, setHasNewAdvice] = useState(false);

  // Show automatically when new advice arrives
  useEffect(() => {
    if (advice && !isLoading) {
      setIsVisible(true);
      setHasNewAdvice(true);
      
      // Auto hide "new" badge after a while
      const timer = setTimeout(() => setHasNewAdvice(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [advice, isLoading]);

  if (!advice && !isLoading) return null;

  // Loading State (Mini)
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 bg-[#1a1a1a] border border-emerald-900/30 p-4 rounded-2xl animate-pulse">
        <div className="w-10 h-10 rounded-full bg-emerald-900/50 flex items-center justify-center">
           <Bot size={20} className="text-emerald-500" />
        </div>
        <div className="space-y-2 flex-1">
           <div className="h-2 bg-gray-800 rounded w-3/4"></div>
           <div className="h-2 bg-gray-800 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!isVisible || !advice) {
     // Minimized State
     return (
        <button 
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 text-emerald-400 text-sm font-bold hover:text-emerald-300 transition-colors bg-emerald-900/10 px-4 py-2 rounded-full border border-emerald-900/30"
        >
           <Bot size={18} />
           Ver consejos del Asistente
           {hasNewAdvice && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>}
        </button>
     );
  }

  return (
    <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111] border border-emerald-500/30 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
      
      {/* Header */}
      <div className="bg-[#0f0f0f] p-4 flex items-center justify-between border-b border-gray-800">
         <div className="flex items-center gap-3">
            <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Bot size={24} className="text-black" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                </div>
            </div>
            <div>
                <h3 className="font-bold text-white text-sm">Asistente de Tráfico</h3>
                <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <Sparkles size={10} />
                    Analizando estrategia...
                </p>
            </div>
         </div>
         <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-white transition-colors"
         >
            <X size={18} />
         </button>
      </div>

      {/* Chat Body */}
      <div className="p-5 space-y-4">
        
        {/* AI Message */}
        <div className="flex gap-3">
            <div className="flex-1 space-y-2">
                 <div className="bg-[#252525] text-gray-200 text-sm p-3 rounded-2xl rounded-tl-none border border-gray-800 leading-relaxed">
                    {advice.score < 50 ? (
                        <p><span className="text-red-400 font-bold">Ojo:</span> Veo que falta información clave. Para que los anuncios funcionen, necesito que me des más "carne".</p>
                    ) : (
                        <p><span className="text-emerald-400 font-bold">¡Buen comienzo!</span> He analizado lo que llevas. Aquí tengo algunas ideas para potenciar tu ángulo de venta:</p>
                    )}
                 </div>
            </div>
        </div>

        {/* Suggestions / Chips */}
        <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider ml-1">Sugerencias rápidas (Click para aplicar)</span>
            <div className="flex flex-col gap-2">
                {advice.suggestions.map((suggestion, idx) => (
                    <button
                        key={idx}
                        onClick={() => onApplySuggestion(suggestion)}
                        className="group flex items-start gap-3 bg-emerald-900/10 hover:bg-emerald-900/20 border border-emerald-900/30 hover:border-emerald-500/50 p-3 rounded-xl transition-all text-left w-full"
                    >
                        <div className="mt-0.5 bg-emerald-500/20 p-1.5 rounded-lg text-emerald-400 group-hover:scale-110 transition-transform">
                            <Lightbulb size={14} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">{suggestion}</p>
                        </div>
                        <ArrowRight size={14} className="text-gray-600 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                ))}
            </div>
        </div>
        
        {/* Score Indicator */}
        <div className="mt-2 pt-3 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
            <span>Calidad del Input:</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${advice.score > 70 ? 'bg-emerald-500' : 'bg-yellow-500'}`} 
                        style={{ width: `${advice.score}%` }}
                    ></div>
                </div>
                <span className="font-mono font-bold text-gray-300">{advice.score}/100</span>
            </div>
        </div>

      </div>
    </div>
  );
};

export default MarketingAssistant;