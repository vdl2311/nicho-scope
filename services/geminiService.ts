
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

export const analyzeMarket = async (topic: string): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("Chave de API está faltando");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Atue como um especialista em Inteligência de Mercado e "Social Listening" Avançado.
    O usuário quer descobrir micro-nichos lucrativos dentro do tópico amplo: "${topic}".
    
    Sua tarefa principal é SIMULAR uma pesquisa profunda em múltiplas fontes de conversas reais:
    1. Seções de comentários do YouTube.
    2. Tendências e comentários do TikTok.
    3. Comentários em posts de influenciadores no Instagram.
    4. Discussões em Grupos de Facebook e Comunidades de WhatsApp (simule as dores compartilhadas lá).
    5. Fóruns especializados (Reddit, Quora e Fóruns de Nicho).
    
    Identifique 10 "micro-nichos" específicos onde a demanda é real (baseada em dores/reclamações dos usuários) mas a oferta atual é fraca.
    
    Para cada micro-nicho, retorne:
    1. Um nome cativante e uma descrição focada na "dor" do usuário.
    2. "Pontuação de Demanda" (0-100): Baseada na frequência de comentários/pedidos.
    3. "Pontuação de Oferta" (0-100): Baseada na qualidade dos vídeos/produtos atuais.
    4. "Pontuação de Oportunidade" (0-100): Cálculo de Demanda vs Oferta.
    5. Dados de tendência (últimos 6 meses) simulando o crescimento.
    6. 5 Palavras-chave (Google Ads) de alta intenção.
    7. Insights de Oferta Detalhados (Supply):
       - Qualidade do Conteúdo/Produtos Existentes.
       - Número de Concorrentes Diretos.
       - Dificuldade de Entrada.
    8. 2 Produtos Digitais que resolveriam o problema.
    9. Insights de Plataforma (CRUCIAL - O que estão falando/pedindo em cada lugar?):
       - Youtube: Reclamações nos vídeos atuais.
       - TikTok: O que viraliza ou o que pedem nos comentários.
       - Google: O que pesquisam (intenção de busca).
       - Instagram: O que comentam nas fotos/reels de influenciadores da área? O que falta no visual?
       - Facebook/WhatsApp: Quais as dúvidas recorrentes nos grupos de discussão/comunidades?
       - Fóruns: Quais tópicos (threads) têm mais engajamento e dúvidas sem resposta?

    IMPORTANTE: 
    - Todo o conteúdo DEVE estar em Português do Brasil.
    - Foque em reclamações reais ("Eu odeio quando...", "Por que ninguém fala sobre...", "Alguém tem indicação de...").
    - Ordene os nichos começando pelo de maior Oportunidade.
    
    Retorne a resposta em formato JSON estrito seguindo o schema.
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      topic: { type: Type.STRING },
      niches: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            demandScore: { type: Type.NUMBER },
            supplyScore: { type: Type.NUMBER },
            opportunityScore: { type: Type.NUMBER },
            trendData: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  month: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                },
                required: ["month", "value"]
              }
            },
            keywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  volume: { type: Type.STRING },
                  cpc: { type: Type.STRING },
                },
                required: ["term", "volume", "cpc"]
              }
            },
            supplyInsights: {
              type: Type.OBJECT,
              properties: {
                qualityAssessment: { type: Type.STRING },
                competitorCount: { type: Type.STRING },
                entryDifficulty: { type: Type.STRING },
              },
              required: ["qualityAssessment", "competitorCount", "entryDifficulty"]
            },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["type", "title", "description"]
              }
            },
            platformInsights: {
              type: Type.OBJECT,
              properties: {
                youtube: { type: Type.STRING },
                tiktok: { type: Type.STRING },
                google: { type: Type.STRING },
                instagram: { type: Type.STRING },
                facebook: { type: Type.STRING },
                forums: { type: Type.STRING },
              },
              required: ["youtube", "tiktok", "google", "instagram", "facebook", "forums"]
            }
          },
          required: ["name", "description", "demandScore", "supplyScore", "opportunityScore", "trendData", "keywords", "supplyInsights", "products", "platformInsights"]
        }
      }
    },
    required: ["topic", "niches"]
  };

  let lastError: any;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text) as AnalysisResult;
        return data;
      } else {
        throw new Error("Resposta vazia da IA");
      }
    } catch (error) {
      console.warn(`Gemini Analysis attempt ${attempt} failed:`, error);
      lastError = error;
      // Wait before retrying (exponential backoff: 1s, 2s, 3s)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error("Final Gemini Analysis Error after retries:", lastError);
  throw lastError;
};