import React, { useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, onImagesChange }) => {
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // Limit to 10 images total
      const combinedFiles = [...images, ...newFiles].slice(0, 10);
      onImagesChange(combinedFiles);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-300">
        Imágenes de Referencia (Opcional, máx 10)
      </label>
      
      <div className="flex flex-wrap gap-4">
        {/* Upload Button */}
        <div className="relative w-24 h-24 flex-shrink-0">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            disabled={images.length >= 10}
          />
          <div className={`w-full h-full border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center text-gray-500 transition-colors ${images.length < 10 ? 'hover:border-emerald-500 hover:text-emerald-500' : 'opacity-50 cursor-not-allowed'}`}>
            <Upload size={20} />
            <span className="text-xs mt-1">Subir</span>
          </div>
        </div>

        {/* Preview List */}
        {images.map((file, idx) => (
          <div key={idx} className="relative w-24 h-24 group">
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-full h-full object-cover rounded-xl border border-gray-700"
            />
            <button
              onClick={() => removeImage(idx)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X size={12} />
            </button>
          </div>
        ))}

        {images.length === 0 && (
          <div className="flex items-center text-sm text-gray-500 italic h-24">
             <ImageIcon className="mr-2 w-4 h-4" />
             La IA inferirá el estilo si no subes nada.
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;