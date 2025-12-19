
import React from 'react';
import { Niche } from '../types';
import TrendChart from './TrendChart';
import ScoreGauge from './ScoreGauge';
import { TrendingUp, Copy, Target, ShoppingBag, Youtube, Search, Heart, Users, ShieldAlert, Star, Instagram, Facebook, MessageSquare, MessageCircle } from 'lucide-react';

interface NicheCardProps {
  niche: Niche;
  isSaved?: boolean;
  onSave?: (niche: Niche) => void;
  onRemove?: (id: string) => void;
}

const NicheCard: React.FC<NicheCardProps> = ({ niche, isSaved = false, onSave, onRemove }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleSaveClick = () => {
    if (isSaved && onRemove) {
      onRemove(niche.id);
    } else if (!isSaved && onSave) {
      onSave(niche);
    }
  };

  // Fallback for legacy saved niches that might not have supplyInsights yet
  const supplyInsights = niche.supplyInsights || {
    qualityAssessment: "Análise indisponível",
    competitorCount: "Dados insuficientes",
    entryDifficulty: "Variável"
  };

  // Fallback for platform insights
  const platforms = niche.platformInsights || {
      youtube: "Sem dados",
      tiktok: "Sem dados",
      google: "Sem dados",
      instagram: "Sem dados",
      facebook: "Sem dados",
      forums: "Sem dados"
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg hover:border-slate-600 transition-colors duration-300 flex flex-col h-full">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-start">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-white mb-1">{niche.name}</h3>
          <p className="text-sm text-slate-400">{niche.description}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <div className="flex items-center space-x-1 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
            <TrendingUp size={14} />
            <span>{niche.opportunityScore}% Oportunidade</span>
          </div>
          <button 
            onClick={handleSaveClick}
            className={`p-2 rounded-full transition-all ${isSaved ? 'bg-pink-500/20 text-pink-500 hover:bg-pink-500/30' : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'}`}
            title={isSaved ? "Remover dos Salvos" : "Salvar Nicho"}
          >
            <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
      </div>

      {/* Scores Grid */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-slate-700 bg-slate-900/30">
        <ScoreGauge score={niche.demandScore} label="Demanda" color="green" />
        <ScoreGauge score={niche.supplyScore} label="Oferta" color="orange" inverse />
        <ScoreGauge score={niche.opportunityScore} label="Potencial" color="blue" />
      </div>

      {/* Trend Chart */}
      <div className="p-6 border-b border-slate-700">
        <h4 className="text-xs font-semibold text-slate-400 uppercase mb-4 tracking-wider">Tendência de Interesse (6 Meses)</h4>
        <TrendChart data={niche.trendData} />
      </div>

      {/* Two Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-px bg-slate-700 flex-1">
        
        {/* Left: Keywords & Platform Insights */}
        <div className="bg-slate-800 p-6">
          <h4 className="flex items-center text-sm font-semibold text-blue-400 mb-4">
            <Search size={16} className="mr-2" /> Top Keywords (Ads)
          </h4>
          <ul className="space-y-3 mb-6">
            {niche.keywords.map((kw, idx) => (
              <li key={idx} className="flex justify-between items-center text-sm group">
                <span className="text-slate-300 font-medium">{kw.term}</span>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-slate-500">{kw.volume}</span>
                    <button 
                        onClick={() => copyToClipboard(kw.term)}
                        className="text-slate-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Copiar Keyword"
                    >
                        <Copy size={12} />
                    </button>
                </div>
              </li>
            ))}
          </ul>

          <h4 className="flex items-center text-sm font-semibold text-red-400 mb-3 mt-6">
             Investigação de Comentários
          </h4>
          <div className="space-y-3 text-xs text-slate-400">
            <div className="flex items-start gap-2">
                <Youtube size={14} className="text-red-500 mt-0.5 shrink-0" />
                <p><span className="text-slate-300 font-medium">YouTube:</span> {platforms.youtube}</p>
            </div>
            <div className="flex items-start gap-2">
                <span className="text-pink-500 font-bold text-[10px] mt-0.5 shrink-0 bg-slate-700 w-3.5 h-3.5 flex items-center justify-center rounded">T</span>
                <p><span className="text-slate-300 font-medium">TikTok:</span> {platforms.tiktok}</p>
            </div>
            {/* New Platforms */}
            {platforms.instagram && (
                <div className="flex items-start gap-2">
                    <Instagram size={14} className="text-pink-600 mt-0.5 shrink-0" />
                    <p><span className="text-slate-300 font-medium">Instagram:</span> {platforms.instagram}</p>
                </div>
            )}
             {platforms.facebook && (
                <div className="flex items-start gap-2">
                    <div className="flex -space-x-1 shrink-0 mt-0.5">
                       <Facebook size={14} className="text-blue-500" />
                       <MessageCircle size={14} className="text-green-500" />
                    </div>
                    <p><span className="text-slate-300 font-medium">Grupos/Zap:</span> {platforms.facebook}</p>
                </div>
            )}
             {platforms.forums && (
                <div className="flex items-start gap-2">
                    <MessageSquare size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <p><span className="text-slate-300 font-medium">Fóruns:</span> {platforms.forums}</p>
                </div>
            )}
          </div>
        </div>

        {/* Right: Supply Analysis & Product Opportunities */}
        <div className="bg-slate-800 p-6 flex flex-col">
          
          {/* Supply/Competition Section - Details regarding Offer, Competitors, Difficulty */}
          <div className="bg-orange-500/5 border border-orange-500/10 rounded-lg p-4 mb-6">
            <h4 className="text-xs font-bold text-orange-400 uppercase mb-3 flex items-center gap-2">
              <Target size={14} /> Análise de Oferta e Concorrência
            </h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Star size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5 uppercase tracking-wide">Qualidade da Oferta</span>
                  <p className="text-sm text-slate-200 font-medium">{supplyInsights.qualityAssessment}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users size={16} className="text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5 uppercase tracking-wide">Concorrentes Diretos</span>
                  <p className="text-sm text-slate-200 font-medium">{supplyInsights.competitorCount}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldAlert size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-500 block mb-0.5 uppercase tracking-wide">Dificuldade de Entrada</span>
                  <p className="text-sm text-slate-200 font-medium">{supplyInsights.entryDifficulty}</p>
                </div>
              </div>
            </div>
          </div>

           <h4 className="flex items-center text-sm font-semibold text-purple-400 mb-4">
            <ShoppingBag size={16} className="mr-2" /> Produtos em Falta
          </h4>
          <div className="space-y-4 flex-1">
            {niche.products.map((prod, idx) => (
              <div key={idx} className="bg-slate-700/30 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-purple-300 uppercase bg-purple-500/10 px-2 py-0.5 rounded">{prod.type}</span>
                </div>
                <h5 className="text-white font-medium text-sm mt-2 mb-1">{prod.title}</h5>
                <p className="text-xs text-slate-400 leading-relaxed">{prod.description}</p>
              </div>
            ))}
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default NicheCard;
