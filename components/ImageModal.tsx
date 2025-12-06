import React from 'react';
import { X, Download, Target, FileText, Copy, LayoutTemplate } from 'lucide-react';
import { GeneratedImage } from '../types';

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, onClose }) => {
  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `neomentes-full-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { adCopy, audience, imagePrompt } = image.strategy;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-50"
      >
        <X size={32} />
      </button>

      <div className="max-w-7xl h-[90vh] w-full flex flex-col md:flex-row gap-0 bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
        
        {/* Image Section */}
        <div className="flex-1 bg-black flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-800 p-4">
          <img 
            src={image.url} 
            alt="Full Preview" 
            className="max-h-full max-w-full object-contain shadow-2xl"
          />
        </div>

        {/* Strategy Sidebar */}
        <div className="w-full md:w-[480px] bg-[#111] flex flex-col h-full">
          
          {/* Header Sidebar */}
          <div className="p-6 border-b border-gray-800 bg-gray-900/50">
            <h3 className="text-emerald-400 font-bold text-lg uppercase tracking-wider flex items-center gap-2">
               <LayoutTemplate size={18} />
               Estrategia del Anuncio
            </h3>
            <p className="text-xs text-gray-500 mt-1">Optimizado para Meta Andromeda</p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            
            {/* SECTION 1: AD COPY */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                <FileText className="text-blue-400" size={18} />
                Copy Sugerido
              </h4>
              
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-4 text-sm">
                <div>
                  <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Texto Principal</span>
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{adCopy.primaryText}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Título (Headline)</span>
                    <p className="text-white font-bold">{adCopy.headline}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs uppercase font-bold block mb-1">CTA</span>
                    <span className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">{adCopy.cta}</span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500 text-xs uppercase font-bold block mb-1">Descripción</span>
                  <p className="text-gray-400 text-xs">{adCopy.description}</p>
                </div>
              </div>
            </div>

            {/* SECTION 2: AUDIENCE */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold flex items-center gap-2 border-b border-gray-800 pb-2">
                <Target className="text-purple-400" size={18} />
                Segmentación (Audience)
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="bg-gray-900/50 p-3 rounded-lg">
                   <strong className="text-gray-400 block text-xs mb-1">Demografía</strong>
                   <p className="text-gray-200">{audience.demographics}</p>
                </div>
                <div className="bg-gray-900/50 p-3 rounded-lg">
                   <strong className="text-gray-400 block text-xs mb-1">Psicografía & Comportamiento</strong>
                   <p className="text-gray-200">{audience.psychographics}</p>
                </div>
                <div>
                   <strong className="text-gray-400 block text-xs mb-2">Intereses Clave</strong>
                   <div className="flex flex-wrap gap-2">
                     {audience.interests.map((interest, idx) => (
                       <span key={idx} className="bg-purple-900/30 text-purple-300 border border-purple-900/50 px-2 py-1 rounded-md text-xs">
                         {interest}
                       </span>
                     ))}
                   </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: PROMPT (Collapsed style or bottom) */}
             <div className="space-y-2 opacity-60 hover:opacity-100 transition-opacity">
              <h4 className="text-gray-400 text-xs font-bold uppercase flex items-center gap-2">
                <Copy size={12} /> Prompt Original
              </h4>
              <p className="text-[10px] text-gray-500 font-mono bg-black p-2 rounded border border-gray-800">
                {imagePrompt}
              </p>
            </div>

          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-gray-800 bg-gray-900/50 z-10">
            <button 
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
            >
              <Download size={20} />
              Descargar Imagen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;