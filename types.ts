
export interface TrendPoint {
  month: string;
  value: number;
}

export interface Keyword {
  term: string;
  volume: string; // e.g., "High", "Medium", "10k+"
  cpc: string;    // e.g., "$2.50"
}

export interface ProductOpportunity {
  type: string; // e.g., "Ebook", "Course"
  title: string;
  description: string;
}

export interface SupplyInsights {
  qualityAssessment: string; // e.g. "Baixa (Vídeos amadores)"
  competitorCount: string;   // e.g. "Baixa ( < 5 canais diretos)"
  entryDifficulty: string;   // e.g. "Fácil", "Médio"
}

export interface Niche {
  id: string;
  name: string;
  description: string;
  demandScore: number; // 0-100
  supplyScore: number; // 0-100
  opportunityScore: number; // Calculated or AI provided
  trendData: TrendPoint[];
  keywords: Keyword[];
  products: ProductOpportunity[];
  platformInsights: {
    youtube: string;
    tiktok: string;
    google: string;
    instagram: string; // Novo
    facebook: string;  // Novo (Grupos FB / WhatsApp)
    forums: string;    // Novo (Reddit / Fóruns dedicados)
  };
  supplyInsights: SupplyInsights;
}

export interface AnalysisResult {
  topic: string;
  niches: Niche[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}
