export interface AdFormData {
  productName: string;
  description: string;
  painPoint: string;
  normalPrice: number;
  offerPrice?: number;
  referenceImages: File[];
}

export interface AudienceProfile {
  demographics: string;
  psychographics: string;
  interests: string[];
}

export interface AdCopy {
  primaryText: string; // The main text above the image
  headline: string;    // The bold text next to CTA
  description: string; // Small text below headline
  cta: string;         // Button text (e.g. Shop Now)
}

export interface AdStrategyResult {
  imagePrompt: string;
  audience: AudienceProfile;
  adCopy: AdCopy;
}

export interface GeneratedImage {
  id: string;
  url: string; // Base64 data URL
  strategy: AdStrategyResult; // Contains prompt, copy, and audience
}

export interface GenerationState {
  isLoading: boolean;
  step: 'idle' | 'analyzing' | 'generating' | 'complete' | 'error';
  message?: string;
}

export interface StrategyResponse {
  ads: AdStrategyResult[];
}

export interface AdAdvice {
  score: number; // 1-100 quality score of current input
  suggestions: string[]; // List of quick tips
  sentiment: 'weak' | 'good' | 'powerful';
}