import React, { useState, useEffect, useRef } from 'react';
import { AdFormData, GeneratedImage, GenerationState, AdAdvice } from './types';
import ImageUploader from './components/ImageUploader';
import ResultsGrid from './components/ResultsGrid';
import ImageModal from './components/ImageModal';
import MarketingAssistant from './components/MarketingAssistant';
import { generateAdCampaign, analyzeInputsForAdvice } from './services/geminiService';
import { Wand2, Zap, AlertCircle, Loader2, BrainCircuit, Plus, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [formData, setFormData] = useState<AdFormData>({
    productName: '',
    description: '',
    painPoint: '',
    normalPrice: 0,
    referenceImages: []
  });

  const [generationState, setGenerationState] = useState<GenerationState>({
    isLoading: false,
    step: 'idle',
  });

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  
  // Advisor State
  const [advice, setAdvice] = useState<AdAdvice | null>(null);
  const [isAdvising, setIsAdvising] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Trigger immediate analysis when image changes
  useEffect(() => {
    if (formData.referenceImages.length > 0) {
       triggerAdvice(formData);
    }
  }, [formData.referenceImages]);

  const triggerAdvice = async (data: AdFormData) => {
     setIsAdvising(true);
     try {
        const newAdvice = await analyzeInputsForAdvice(data);
        setAdvice(newAdvice);
     } catch (err) {
        console.error("Advice error", err);
     } finally {
        setIsAdvising(false);
     }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const newFormData = {
      ...formData,
      [name]: name.includes('Price') ? parseFloat(value) || 0 : value
    };

    setFormData(newFormData);

    // Debounce Advice Call for text inputs
    if (name === 'productName' || name === 'description' || name === 'painPoint') {
       if (debounceTimer.current) clearTimeout(debounceTimer.current);
       
       debounceTimer.current = setTimeout(() => {
          if (newFormData.productName.length > 3) {
             triggerAdvice(newFormData);
          }
       }, 1500); 
    }
  };

  const handleImagesChange = (files: File[]) => {
    setFormData(prev => ({ ...prev, referenceImages: files }));
  };

  const handleApplySuggestion = (suggestion: string) => {
    // Simple logic: append suggestion to pain point if not present
    setFormData(prev => ({
      ...prev,
      painPoint: prev.painPoint ? `${prev.painPoint}. ${suggestion}` : suggestion
    }));
  };

  const handleClearResults = () => {
    setGeneratedImages([]);
    setGenerationState({ isLoading: false, step: 'idle' });
  };

  const handleGenerate = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing. Please configure process.env.API_KEY.");
      return;
    }
    
    if (!formData.productName || !formData.painPoint || !formData.normalPrice) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    setGenerationState({ isLoading: true, step: 'analyzing', message: 'Iniciando motores creativos...' });
    
    try {
      const results = await generateAdCampaign(formData, (msg) => {
        setGenerationState(prev => ({ ...prev, message: msg }));
      });

      const newImages: GeneratedImage[] = results.map((res) => ({
        id: crypto.randomUUID(),
        url: res.url,
        strategy: res.strategy
      }));

      // APPEND new images to the beginning of the list (Newest first)
      setGeneratedImages(prev => [...newImages, ...prev]);
      setGenerationState({ isLoading: false, step: 'complete' });

    } catch (error: any) {
      console.error(error);
      setGenerationState({ 
        isLoading: false, 
        step: 'error', 
        message: 'Hubo un error generando los anuncios. Intenta de nuevo.' 
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-emerald-500/30">
      
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Zap className="text-black fill-current" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter font-mono">ANUNCIOS NEOMENTES 2.0</h1>
              <p className="text-xs text-gray-400 tracking-widest uppercase">Meta Andromeda Optimized</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-purple-900/20 border border-purple-500/30 px-3 py-1.5 rounded-full">
             <BrainCircuit size={14} className="text-purple-400" />
             <span className="text-xs font-bold text-purple-300">Gemini 3.0 Thinking Mode: ACTIVADO</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Input Column */}
          <div className="lg:col-span-4 space-y-8 h-fit sticky top-24">
            <div className="bg-[#111] p-6 rounded-3xl border border-gray-800 shadow-2xl">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-6 bg-emerald-500 rounded-full inline-block"></span>
                Configuración
              </h2>

              <div className="space-y-5">
                <ImageUploader 
                  images={formData.referenceImages} 
                  onImagesChange={handleImagesChange} 
                />

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Producto</label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ej: Serum X"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descripción</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    maxLength={300}
                    rows={2}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Detalles clave..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-400 uppercase mb-2">Dolor Principal</label>
                  <textarea
                    name="painPoint"
                    value={formData.painPoint}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full bg-gray-900 border border-emerald-900/50 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Ej: Miedo a..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Precio</label>
                    <input
                      type="number"
                      name="normalPrice"
                      value={formData.normalPrice || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Oferta</label>
                    <input
                      type="number"
                      name="offerPrice"
                      value={formData.offerPrice || ''}
                      onChange={handleInputChange}
                      className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      placeholder="Opcional"
                    />
                  </div>
                </div>
              </div>

              {/* Assistant */}
              <div className="mt-6">
                 <MarketingAssistant 
                    advice={advice} 
                    isLoading={isAdvising} 
                    onApplySuggestion={handleApplySuggestion}
                 />
              </div>

              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={generationState.isLoading}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-900/30
                    ${generationState.isLoading 
                      ? 'bg-gray-700 text-gray-400 cursor-wait' 
                      : 'bg-gradient-to-r from-emerald-600 to-emerald-400 text-black hover:from-emerald-500 hover:to-emerald-300'}`}
                >
                  {generationState.isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Pensando...
                    </>
                  ) : generatedImages.length > 0 ? (
                    <>
                      <Plus size={24} />
                      GENERAR 4 MÁS
                    </>
                  ) : (
                    <>
                      <Wand2 size={24} />
                      GENERAR CAMPAÑA
                    </>
                  )}
                </button>
                
                {generationState.step === 'error' && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {generationState.message}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 flex flex-col min-h-[600px]">
            
            {generationState.isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-6 animate-pulse bg-gray-900/30 rounded-3xl border border-gray-800 mb-8">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="text-purple-400 animate-pulse" size={24} />
                    </div>
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-emerald-400">{generationState.message}</h3>
                  <p className="text-gray-500 text-sm">Aplicando estrategia de variación aleatoria...</p>
                </div>
              </div>
            )}

            {!generationState.isLoading && generatedImages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-4 border-2 border-dashed border-gray-800 rounded-3xl p-12">
                <Wand2 size={64} className="opacity-20" />
                <p className="text-xl font-medium">Tus anuncios generados aparecerán aquí</p>
                <p className="text-sm text-gray-500">Rellena el formulario para comenzar</p>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="animate-fade-in">
                 <div className="mb-6 flex items-center justify-between sticky top-24 bg-[#0a0a0a]/95 py-4 z-30 backdrop-blur-md border-b border-gray-900">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-bold text-white">Galería de Resultados</h2>
                      <span className="bg-emerald-900/30 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-900/50">
                        {generatedImages.length} Creativos
                      </span>
                    </div>
                    
                    <button 
                      onClick={handleClearResults}
                      className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 size={14} />
                      Limpiar Todo
                    </button>
                 </div>
                 
                 <div className="bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-xl mb-6 text-sm text-emerald-300 flex items-center gap-2">
                    <BrainCircuit size={16} />
                    Cada vez que generas, la IA utiliza una "semilla de caos" para explorar nuevos ángulos creativos.
                 </div>

                 <ResultsGrid images={generatedImages} onOpenModal={setSelectedImage} />
              </div>
            )}

          </div>
        </div>
      </main>

      <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
};

export default App;