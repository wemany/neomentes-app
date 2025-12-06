import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AdFormData, StrategyResponse, AdStrategyResult, AdAdvice } from "../types";

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to format currency to COP
const formatCOP = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// Initialize Gemini Client
const createClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Real-time Advisor (Traffic Assistant)
 * Uses Flash model for speed to give feedback on inputs and visual context
 */
export const analyzeInputsForAdvice = async (formData: AdFormData): Promise<AdAdvice> => {
  const ai = createClient();
  
  // Determine if we are analyzing image context or just text
  const hasImage = formData.referenceImages && formData.referenceImages.length > 0;
  const inputs = hasImage 
    ? await Promise.all(formData.referenceImages.map(fileToGenerativePart)) 
    : [];

  const contextPrompt = hasImage 
    ? "El usuario ha subido una imagen del producto. Mírala bien y dime qué es." 
    : "El usuario aún no sube imagen, básate solo en el texto.";

  const prompt = `
    Actúa como un Asistente de Marketing Digital Proactivo y Amigable ("Tu Traffic Manager de Confianza").
    Tu tono debe ser conversacional, cercano y útil. Como un compañero de trabajo experto.
    
    CONTEXTO:
    ${contextPrompt}
    Producto Texto: ${formData.productName || "No definido"}
    Descripción: ${formData.description || "No definida"}
    Dolor: ${formData.painPoint || "No definido"}
    Precio: ${formData.normalPrice || "No definido"}

    TU TAREA:
    Analiza los inputs y da recomendaciones proactivas en formato JSON.
    Usa un lenguaje natural tipo: "Ey, vi que subiste una foto de unas zapatillas...", "Oye, ese precio me parece un poco alto para...", "Para ese dolor, te recomiendo..."

    SALIDA JSON:
    - score: (0-100) Calidad de la configuración actual.
    - sentiment: ('weak', 'good', 'powerful')
    - suggestions: Array de 3 frases cortas y conversacionales que el usuario podría usar directamente como "Dolor Principal" o mejoras al copy.
      Ejemplos:
      * "Vergüenza al sonreír en fotos grupales" (Si es blanqueamiento dental)
      * "Frustración porque la ropa no me queda igual" (Si es fitness)
      * "El miedo a que se rompa en el primer uso" (Si es herramienta)
      
    IMPORTANTE:
    Si detectas la imagen, EMPIEZA tus sugerencias basándote en lo que ves.
    "Vi que es [Producto], prueba enfocarte en [Beneficio visual]."
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER },
      sentiment: { type: Type.STRING, enum: ['weak', 'good', 'powerful'] },
      suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
    },
    required: ["score", "sentiment", "suggestions"]
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...inputs,
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AdAdvice;
    }
    throw new Error("No advice generated");
  } catch (e) {
    console.error("Advice Error:", e);
    return { score: 0, suggestions: ["Sube una imagen o escribe más detalles para que pueda ayudarte..."], sentiment: 'weak' };
  }
};


/**
 * Step 1: The Strategist
 * Uses gemini-3-pro-preview with THINKING to analyze inputs and generate 4 distinct strategies.
 */
const generateStrategy = async (formData: AdFormData, imageParts: any[]): Promise<AdStrategyResult[]> => {
  const ai = createClient();
  
  // Format prices for the prompt
  const normalPriceFormatted = formatCOP(formData.normalPrice);
  const offerPriceFormatted = formData.offerPrice ? formatCOP(formData.offerPrice) : "No aplica";

  // Use current time as seed for variety
  const seed = Date.now();
  const randomContext = Math.random().toString(36).substring(7); // Extra chaos

  const systemInstruction = `
    Eres un Director Creativo experto en "Direct Response Marketing" (Respuesta Directa).
    Tu objetivo es generar conceptos publicitarios ALTAMENTE VARIADOS, ÚNICOS y DISRUPTIVOS.
    Tu meta NO es hacer arte, es VENDER.

    1️⃣ INPUTS DEL USUARIO
    - Producto: ${formData.productName}
    - Descripción: ${formData.description}
    - Dolor Principal: ${formData.painPoint}
    - Precio Normal: ${normalPriceFormatted}
    - Precio Oferta: ${offerPriceFormatted}

    🚨 REGLA DE ORO SOBRE PRECIOS:
    - SIEMPRE usa el formato completo con separadores de miles (ej: $100.000).

    2️⃣ LIBRERÍA DE ESTRATEGIAS (FRAMEWORKS)
    De esta lista de 12, selecciona 4 DIFERENTES al azar basándote en la semilla: ${seed}.
    
    1. "EL MAPA DE BENEFICIOS" (Producto central + flechas con beneficios clave).
    2. "NOSOTROS vs ELLOS" (Split screen: Competencia aburrida vs Tu producto vibrante).
    3. "METÁFORA VISUAL" (Problema visualizado dramáticamente vs Solución celestial).
    4. "LA OFERTA IRRESISTIBLE" (Producto + Sticker de precio gigante + Urgencia).
    5. "VISIÓN DE RAYOS X" (Transparencia mostrando ingredientes o tecnología interna).
    6. "PRUEBA SOCIAL VISUAL" (Producto rodeado de estrellas o captura de review real).
    7. "PROBLEMA AGITADO" (Primer plano del 'dolor' en B/N o tonos rojos + Producto a color).
    8. "LIFESTYLE ASPIRACIONAL" (El producto en situación de uso ideal/feliz, plano medio).
    9. "DATOS DUROS" (Gráfico de barras o porcentaje grande superpuesto al producto).
    10. "UNBOXING ESTATICO" (El producto saliendo de la caja o empaque, sensación de novedad).
    11. "ANTES Y DESPUÉS ARTÍSTICO" (División diagonal, izquierda problema, derecha solución brillante).
    12. "MACRO TEXTURA" (Zoom extremo al producto mostrando calidad + texto gigante).

    3️⃣ REGLAS DE VARIEDAD EXTREMA ("CHAOS MODE")
    - SEMILLA DE VARIACIÓN: ${seed}-${randomContext}
    - NO repitas los mismos frameworks que usarías por defecto.
    - Varía drásticamente los colores de fondo (Neon, Pastel, Oscuro, Gradiente).
    - Varía los ángulos de cámara (Cenital, Gusano, Frontal, Isométrico).
    - Inventa combinaciones visuales nuevas.

    4️⃣ FORMATO DE SALIDA
    Devuelve un JSON con 'imagePrompt', 'audience', y 'adCopy'.
    IMPORTANTE SOBRE 'imagePrompt':
    - Prompt técnico en INGLÉS para Imagen 2.
    - ESPECIFICA CLARAMENTE EL TEXTO A RENDERIZAR en español.
    - Si incluyes precio, escríbelo tal cual: "${offerPriceFormatted}".
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      ads: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            imagePrompt: { type: Type.STRING, description: "Prompt visual técnico en INGLÉS. Debe incluir instrucciones explícitas de texto para renderizar y detalles de iluminación/composición." },
            audience: {
              type: Type.OBJECT,
              properties: {
                demographics: { type: Type.STRING },
                psychographics: { type: Type.STRING },
                interests: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["demographics", "psychographics", "interests"]
            },
            adCopy: {
              type: Type.OBJECT,
              properties: {
                primaryText: { type: Type.STRING },
                headline: { type: Type.STRING },
                description: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["primaryText", "headline", "description", "cta"]
            }
          },
          required: ["imagePrompt", "audience", "adCopy"]
        }
      },
    },
    required: ["ads"],
  };

  const model = "gemini-3-pro-preview"; 

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      ...imageParts,
      { text: `Genera 4 estrategias de anuncios ganadores en JSON. \nSEED: ${seed}. ¡Sorpréndeme con variedad!` }
    ],
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      thinkingConfig: { thinkingBudget: 32768 },
    },
  });

  const jsonText = response.text;
  if (!jsonText) throw new Error("No strategy generated");
  
  const parsed = JSON.parse(jsonText) as StrategyResponse;
  return parsed.ads;
};

/**
 * Step 2: The Artist
 * Generates an image from a single prompt, USING THE REFERENCE IMAGE.
 */
const generateImageFromPrompt = async (prompt: string, referenceImagePart?: any): Promise<string> => {
  const ai = createClient();
  // UPDATED: Downgrade to gemini-2.5-flash-image (Nano Banana Normal) for free usage
  const model = "gemini-2.5-flash-image";

  const contents: any[] = [];
  
  if (referenceImagePart) {
    contents.push(referenceImagePart);
    contents.push({ text: "INSTRUCTION: Use this reference image as the main product. " + prompt });
  } else {
    contents.push({ text: prompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contents,
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) throw new Error("No candidates returned");

    for (const candidate of candidates) {
      const parts = candidate.content.parts;
      const imagePart = parts.find(p => p.inlineData);
      
      if (imagePart && imagePart.inlineData) {
         return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
      }
    }
    
    throw new Error("Model processed request but returned no image data.");

  } catch (e) {
    console.error("Image Gen Error:", e);
    throw e;
  }
};

/**
 * Main Orchestrator
 */
export const generateAdCampaign = async (
  formData: AdFormData, 
  onStatusUpdate: (msg: string) => void
): Promise<{ strategy: AdStrategyResult, url: string }[]> => {
  
  try {
    // 1. Convert Images first
    onStatusUpdate("👀 Analizando producto y referencias...");
    const imageParts = await Promise.all(formData.referenceImages.map(fileToGenerativePart));

    // 2. Strategy Phase
    onStatusUpdate("🧠 Diseñando estrategias únicas (Gemini 3.0 Thinking)...");
    const strategies = await generateStrategy(formData, imageParts);
    
    // 3. Generation Phase (Parallel)
    onStatusUpdate("🎨 Creando artes visuales con Nano Banana...");
    
    const mainReference = imageParts.length > 0 ? imageParts[0] : undefined;

    const generationPromises = strategies.slice(0, 4).map(async (strategyItem, index) => {
      try {
        const enhancedPrompt = `
          Create a high-converting advertising image for social media.
          
          CRITICAL INSTRUCTIONS:
          1. REFERENCE PRODUCT: Integrate the provided product image naturally into the scene.
          2. TEXT RENDERING: You MUST render the text specified in the description clearly and boldly on the image.
          3. LANGUAGE: All rendered text must be in SPANISH.
          4. STYLE: Direct Response style (high contrast, punchy colors, readable text).
          
          IMAGE DESCRIPTION:
          ${strategyItem.imagePrompt}
        `;
        
        const url = await generateImageFromPrompt(enhancedPrompt, mainReference);
        return { strategy: strategyItem, url };
      } catch (error) {
        console.error(`Failed to generate image ${index + 1}`, error);
        return null;
      }
    });

    const results = await Promise.all(generationPromises);
    const validResults = results.filter((r): r is { strategy: AdStrategyResult, url: string } => r !== null);
    
    if (validResults.length === 0) {
      throw new Error("No se pudieron generar imágenes. Intenta de nuevo.");
    }

    return validResults;

  } catch (error) {
    console.error("Campaign Generation Error:", error);
    throw error;
  }
};