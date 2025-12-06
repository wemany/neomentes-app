import React, { useState } from 'react';
import { GeneratedImage } from '../types';
import { Download, Maximize2 } from 'lucide-react';

interface ResultsGridProps {
  images: GeneratedImage[];
  onOpenModal: (image: GeneratedImage) => void;
}

const ResultsGrid: React.FC<ResultsGridProps> = ({ images, onOpenModal }) => {
  
  const handleDownload = (e: React.MouseEvent, img: GeneratedImage) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `neomentes-ad-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto mt-8 animate-fade-in">
      {images.map((img, index) => (
        <div 
          key={img.id} 
          className="group relative bg-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700 transition-all hover:scale-[1.02] hover:border-emerald-500/50 aspect-square cursor-pointer"
          onClick={() => onOpenModal(img)}
        >
          <img 
            src={img.url} 
            alt={`Generated Ad ${index + 1}`} 
            className="w-full h-full object-cover"
          />
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <button 
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all border border-white/20"
              onClick={() => onOpenModal(img)}
            >
              <Maximize2 size={18} />
              <span className="font-medium">Ver Grande</span>
            </button>
            
            <button 
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg shadow-emerald-500/20 transition-all font-bold"
              onClick={(e) => handleDownload(e, img)}
            >
              <Download size={18} />
              <span>Descargar</span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent">
            <span className="text-xs text-gray-300 font-mono">NEOMENTES GEN #{img.id.slice(0,4)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsGrid;