import React, { useState, useEffect } from 'react';
import { Search, Activity, Zap, AlertCircle, Loader2, LogIn, User as UserIcon, BookHeart, LogOut, FileDown, Trash2 } from 'lucide-react';
import { analyzeMarket } from './services/geminiService';
import { AnalysisResult, User, Niche } from './types';
import NicheCard from './components/NicheCard';
import AuthModal from './components/AuthModal';
import { authService } from './services/authService';
import { storageService } from './services/storageService';
import { generatePDF } from './services/pdfService';

const App: React.FC = () => {
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App Data State
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Saved Niches State
  const [view, setView] = useState<'search' | 'saved'>('search');
  const [savedNiches, setSavedNiches] = useState<Niche[]>([]);

  // Load initial user and saved niches
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setSavedNiches(storageService.getSavedNiches(currentUser.id));
    }
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setSavedNiches(storageService.getSavedNiches(loggedInUser.id));
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setSavedNiches([]);
    setView('search');
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setView('search');

    try {
      const data = await analyzeMarket(topic);
      // Ensure unique IDs if the AI doesn't provide them perfectly or if they collide across sessions
      const nichesWithIds = data.niches.map((n, i) => ({
        ...n,
        id: n.id && n.id.length > 5 ? n.id : `${topic.replace(/\s+/g, '-').toLowerCase()}-${i}-${Date.now()}`
      }));
      setResult({ ...data, niches: nichesWithIds });
    } catch (err: any) {
      setError("Falha ao analisar o mercado. Por favor, tente novamente mais tarde ou verifique sua chave de API.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNiche = (niche: Niche) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    storageService.saveNiche(user.id, niche);
    setSavedNiches(storageService.getSavedNiches(user.id));
  };

  const handleRemoveNiche = (nicheId: string) => {
    if (!user) return;
    storageService.removeNiche(user.id, nicheId);
    setSavedNiches(storageService.getSavedNiches(user.id));
  };

  const isNicheSaved = (id: string) => {
    return savedNiches.some(n => n.id === id);
  };

  const downloadReport = () => {
    if (view === 'search' && result) {
      generatePDF(result.topic, result.niches);
    } else if (view === 'saved' && savedNiches.length > 0) {
      generatePDF("Meus Nichos Salvos", savedNiches);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 pb-20">
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setView('search')}>
            <div className="bg-blue-600 p-1.5 rounded-lg">
                <Activity size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white hidden md:block">NicheScope</span>
          </div>
          
          <div className="flex items-center space-x-4">
             {user ? (
               <>
                <button 
                  onClick={() => setView('saved')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${view === 'saved' ? 'bg-slate-800 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                >
                  <BookHeart size={18} />
                  <span className="text-sm font-medium">Salvos ({savedNiches.length})</span>
                </button>
                <div className="h-6 w-px bg-slate-800 mx-2"></div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                      <UserIcon size={16} />
                    </div>
                    <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
                    title="Sair"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
               </>
             ) : (
               <button 
                onClick={() => setShowAuthModal(true)}
                className="flex items-center space-x-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg transition-all"
               >
                 <LogIn size={16} />
                 <span>Entrar / Cadastrar</span>
               </button>
             )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {view === 'search' && (
          <>
            {/* Hero / Search Section */}
            <div className="flex flex-col items-center text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                Encontre sua Próxima <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Mina de Ouro</span> em Micro-Nichos
              </h1>
              <p className="text-lg text-slate-400 mb-8 max-w-2xl">
                Analise lacunas de mercado usando IA. Agregamos insights de tendências de busca, reclamações em comentários e dados de concorrência para encontrar oportunidades de alta demanda e baixa oferta.
              </p>

              <form onSubmit={handleSearch} className="w-full max-w-xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Digite um tópico amplo (ex: 'Café', 'Trabalho Remoto')"
                        className="w-full bg-slate-900 text-white border border-slate-700 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 shadow-2xl text-lg placeholder:text-slate-500"
                    />
                    <button 
                        type="submit" 
                        disabled={loading || !topic}
                        className="absolute right-2 bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={24} /> : <Search size={24} />}
                    </button>
                </div>
              </form>
              
              {/* Quick Suggestions */}
              {!result && !loading && (
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    {['Vida Sustentável', 'Home Office', 'Adestramento Pet', 'Suplementos Veganos'].map((tag) => (
                        <button 
                            key={tag}
                            onClick={() => { setTopic(tag); }}
                            className="text-xs font-medium text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full hover:border-slate-600 hover:text-white transition-all"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="max-w-3xl mx-auto mb-10 p-4 bg-red-900/20 border border-red-900/50 rounded-lg flex items-center gap-3 text-red-200">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            {/* Results Section */}
            {result && (
                <div className="animate-fade-in-up">
                    {/* Header with Buttons aligned */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400 fill-current" size={24} />
                            Oportunidades em "{result.topic}"
                        </h2>
                        
                        <div className="flex items-center gap-3">
                          <button 
                              onClick={downloadReport}
                              className="flex items-center space-x-2 text-sm font-medium text-emerald-400 bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 hover:border-emerald-500 px-4 py-2 rounded-lg transition-all shadow-sm"
                              title="Salvar relatório em PDF"
                          >
                              <FileDown size={18} />
                              <span>Salvar Relatório em PDF</span>
                          </button>
                          <button 
                              onClick={() => setResult(null)}
                              className="flex items-center space-x-2 text-sm font-medium text-slate-400 hover:text-white px-3 py-2 hover:bg-slate-800 rounded-lg transition-all"
                          >
                              <Trash2 size={16} />
                              <span>Limpar</span>
                          </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {result.niches.map((niche) => (
                            <NicheCard 
                              key={niche.id} 
                              niche={niche} 
                              onSave={handleSaveNiche}
                              onRemove={handleRemoveNiche}
                              isSaved={isNicheSaved(niche.id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State Visuals */}
            {loading && !result && (
                <div className="max-w-3xl mx-auto text-center py-12">
                    <div className="inline-block animate-bounce mb-4">
                        <Activity size={48} className="text-blue-500" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">Investigando Comentários e Dados...</h3>
                    <p className="text-slate-500 text-sm">
                        Analisando reclamações no YouTube, tendências do TikTok e volumes de busca para "{topic}".
                    </p>
                </div>
            )}
          </>
        )}

        {view === 'saved' && (
          <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BookHeart className="text-blue-400" size={24} />
                    Nichos Salvos
                </h2>
                
                {savedNiches.length > 0 && (
                  <button 
                      onClick={downloadReport}
                      className="flex items-center space-x-2 text-sm font-medium text-emerald-400 bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 hover:border-emerald-500 px-4 py-2 rounded-lg transition-all shadow-sm"
                  >
                      <FileDown size={18} />
                      <span>Salvar Relatório em PDF</span>
                  </button>
                )}
             </div>
             
             {savedNiches.length === 0 ? (
               <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4 text-slate-500">
                   <BookHeart size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-white mb-1">Nenhum nicho salvo ainda</h3>
                 <p className="text-slate-400 max-w-sm mx-auto mb-6">
                   Pesquise tópicos e salve os micro-nichos mais promissores para acompanhá-los aqui.
                 </p>
                 <button 
                   onClick={() => setView('search')}
                   className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg font-medium transition-colors"
                 >
                   Começar a Pesquisar
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {savedNiches.map((niche) => (
                      <NicheCard 
                        key={niche.id} 
                        niche={niche} 
                        onSave={handleSaveNiche}
                        onRemove={handleRemoveNiche}
                        isSaved={true}
                      />
                  ))}
               </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
};

export default App;