import React, { useState, useRef, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import ProfileMenu from '../components/ProfileMenu';

function AnalysisDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const chatEndRef = useRef(null);
  const [chatInput, setChatInput] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [commentFilter, setCommentFilter] = useState(null);

  // Fetch analysis
  const { data: analysis, isLoading } = useQuery({
    queryKey: ['analysis', id],
    queryFn: async () => { const { data } = await api.get(`/analyses/${id}`); return data.analysis; },
  });

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ['comments', id, commentFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '10' });
      if (commentFilter) params.set('sentiment', commentFilter);
      const { data } = await api.get(`/analyses/${id}/comments?${params}`);
      return data;
    },
    enabled: !!id,
  });

  // Fetch chat history
  const { data: chatData } = useQuery({
    queryKey: ['chat-history', id],
    queryFn: async () => { const { data } = await api.get(`/chat/${id}/history`); return data; },
    enabled: !!id,
  });

  // Send chat message
  const chatMutation = useMutation({
    mutationFn: async (message) => { const { data } = await api.post(`/chat/${id}`, { message }); return data; },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['chat-history', id] }); },
  });

  // Share report
  const shareMutation = useMutation({
    mutationFn: async () => { const { data } = await api.post(`/reports/analyses/${id}/share`); return data; },
  });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatMutation.isPending) return;
    chatMutation.mutate(chatInput.trim());
    setChatInput('');
  };

  const handleQuickPrompt = (text) => {
    if (chatMutation.isPending) return;
    chatMutation.mutate(text);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatData]);

  const handleShare = async () => {
    const result = await shareMutation.mutateAsync();
    const url = `${window.location.origin}/report/${result.share_token}`;
    await navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  };

  if (isLoading || !analysis) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  const a = analysis;
  const comments = commentsData?.comments ?? [];
  const messages = chatData?.messages ?? [];

  // Chart calculations
  const posPct = a.positive_pct || 0;
  const negPct = a.negative_pct || 0;
  const neuPct = a.neutral_pct || 0;
  const posDash = (posPct / 100) * 100;
  const negDash = (negPct / 100) * 100;
  const neuDash = (neuPct / 100) * 100;

  // VADER vs Model bar data
  const vader = a.vader_summary || {};
  const model = a.model_summary || {};
  const barCategories = ['positive', 'negative', 'neutral'];
  const barLabels = ['Positif', 'Negatif', 'Netral'];

  const formatNum = (n) => n ? n.toLocaleString() : '0';

  const sentimentColor = (s) => {
    if (s === 'positive') return 'bg-emerald-500/10 text-emerald-400';
    if (s === 'negative') return 'bg-red-500/10 text-red-400';
    return 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="bg-surface text-on-surface selection:bg-primary/30 min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 shadow-2xl shadow-black/40 tracking-tight">
        <div className="text-xl font-bold tracking-tighter text-slate-100 uppercase">CineSentia</div>
        <div className="hidden md:flex items-center space-x-8">
          <Link className="text-slate-400 hover:text-slate-200 transition-colors" to="/dashboard">Dashboard</Link>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">Features</a>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">About</a>
        </div>
        <div className="flex items-center space-x-4">
          <ProfileMenu />
        </div>
      </nav>

      {/* SideNavBar (Desktop) */}
      <aside className="fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 flex flex-col py-20 text-sm hidden md:flex">
        <div className="px-6 mb-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl abyssal-gradient flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined">psychology</span>
            </div>
            <div>
              <div className="text-lg font-black text-slate-100">AI Explorer</div>
              <div className="text-xs text-slate-500">Deep Dive Analysis</div>
            </div>
          </div>
          <Link to="/analyze" className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform active:scale-95">
            <span className="material-symbols-outlined">add</span>
            <span>New Analysis</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1">
          <Link className="flex items-center px-6 py-3 text-slate-500 hover:text-slate-300 transition-all hover:bg-slate-800" to="/dashboard">
            <span className="material-symbols-outlined mr-3">analytics</span><span>Sentiments</span>
          </Link>
          <a className="flex items-center px-6 py-3 bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500" href="#">
            <span className="material-symbols-outlined mr-3">psychology</span><span>AI Explorer</span>
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className={`pt-24 pb-12 px-6 md:ml-64 transition-all duration-300 ${chatOpen ? 'lg:mr-[400px]' : ''}`}>
        {/* Header Section */}
        <header className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden group">
              {a.thumbnail_url ? (
                <img className="w-full h-full object-cover" alt={a.video_title} src={a.thumbnail_url} />
              ) : (
                <div className="w-full h-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">movie</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">{a.video_title || 'Untitled'}</h1>
              <div className="flex items-center space-x-3 text-on-surface-variant">
                <div className="w-6 h-6 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <span className="font-medium">{a.channel_name || 'Unknown'}</span>
                <span className="text-xs opacity-50">•</span>
                <span className="text-sm">{a.view_count ? `${(a.view_count / 1e6).toFixed(1)}M Views` : ''}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={handleShare} disabled={shareMutation.isPending} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary flex items-center space-x-2 transition-all">
                  <span className="material-symbols-outlined text-sm">{shareMutation.isSuccess ? 'check' : 'share'}</span>
                  <span className="text-sm font-semibold">{shareMutation.isSuccess ? 'Copied!' : 'Share Report'}</span>
                </button>
                <button onClick={() => setChatOpen(!chatOpen)} className="px-4 py-2 rounded-lg abyssal-gradient text-on-primary flex items-center space-x-2 transition-all lg:hidden">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span className="text-sm font-semibold">Tanya Chatbot</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hidden lg:block text-right">
            <div className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Model Accuracy</div>
            <div className="text-4xl font-black text-primary">{a.model_accuracy ? `${a.model_accuracy.toFixed(1)}%` : '—'}</div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface-container p-6 rounded-xl relative overflow-hidden">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Total Comments</div>
            <div className="text-3xl font-bold">{formatNum(a.total_comments)}</div>
            <div className="absolute -right-2 -bottom-4 opacity-5"><span className="material-symbols-outlined text-8xl">forum</span></div>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border-l-4 border-emerald-500/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Positif</div>
            <div className="text-3xl font-bold text-emerald-400">{formatNum(a.positive_count)}</div>
            <div className="text-xs text-emerald-500/60 mt-1">{posPct.toFixed(1)}%</div>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border-l-4 border-red-500/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Negatif</div>
            <div className="text-3xl font-bold text-red-400">{formatNum(a.negative_count)}</div>
            <div className="text-xs text-red-500/60 mt-1">{negPct.toFixed(1)}%</div>
          </div>
          <div className="bg-surface-container p-6 rounded-xl border-l-4 border-slate-500/30">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-2">Netral</div>
            <div className="text-3xl font-bold text-slate-400">{formatNum(a.neutral_count)}</div>
            <div className="text-xs text-slate-500/60 mt-1">{neuPct.toFixed(1)}%</div>
          </div>
        </section>

        {/* Charts Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="lg:col-span-1 bg-surface-container-low p-6 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-on-surface">Distribusi Sentimen</h3>
              {a.top_keyword && <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">{a.top_keyword}</span>}
            </div>
            <div className="relative aspect-square max-w-[200px] mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle className="stroke-emerald-500/20" cx="18" cy="18" fill="none" r="16" strokeWidth="4" />
                <circle className="stroke-emerald-500" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${posDash}, 100`} strokeWidth="4" />
                <circle className="stroke-red-500" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${negDash}, 100`} strokeDashoffset={`-${posDash}`} strokeWidth="4" />
                <circle className="stroke-slate-500" cx="18" cy="18" fill="none" r="16" strokeDasharray={`${neuDash}, 100`} strokeDashoffset={`-${posDash + negDash}`} strokeWidth="4" />
              </svg>
              <div className="absolute text-center">
                <div className="text-2xl font-black">{Math.round(posPct)}%</div>
                <div className="text-[10px] uppercase text-on-surface-variant">Positif</div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm"><span className="flex items-center"><span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>Positif</span><span className="font-semibold">{posPct.toFixed(1)}%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>Negatif</span><span className="font-semibold">{negPct.toFixed(1)}%</span></div>
              <div className="flex items-center justify-between text-sm"><span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>Netral</span><span className="font-semibold">{neuPct.toFixed(1)}%</span></div>
            </div>
          </div>

          {/* Bar Chart: VADER vs Model */}
          <div className="lg:col-span-2 bg-surface-container-low p-6 rounded-xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-on-surface">VADER vs Model</h3>
              <div className="text-xs text-on-surface-variant">Comparison</div>
            </div>
            <div className="h-64 flex items-end justify-around gap-4 px-4">
              {barCategories.map((cat, i) => {
                const vPct = vader[cat] || 0;
                const mPct = model[cat] || 0;
                const maxVal = Math.max(vPct, mPct, 1);
                return (
                  <div key={cat} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-end justify-center gap-1 w-full h-56">
                      <div className="w-4 bg-slate-700 rounded-t-sm transition-all hover:bg-slate-600" style={{ height: `${(vPct / 100) * 100}%` }} title={`VADER: ${vPct.toFixed(1)}%`}></div>
                      <div className="w-4 abyssal-gradient rounded-t-sm" style={{ height: `${(mPct / 100) * 100}%` }} title={`Model: ${mPct.toFixed(1)}%`}></div>
                    </div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">{barLabels[i]}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <div className="flex items-center"><div className="w-3 h-3 bg-slate-700 rounded mr-2"></div>VADER</div>
              <div className="flex items-center"><div className="w-3 h-3 bg-primary rounded mr-2"></div>Sentia Engine</div>
            </div>
          </div>
        </section>

        {/* Comments Preview */}
        <section className="bg-surface-container rounded-xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="font-bold">Comments Preview</h3>
            <div className="flex gap-2">
              {[null, 'positive', 'negative', 'neutral'].map((f) => (
                <button key={f || 'all'} onClick={() => setCommentFilter(f)} className={`text-xs px-3 py-1 rounded-full border transition-all ${commentFilter === f ? 'border-primary text-primary bg-primary/10' : 'border-white/10 text-on-surface-variant hover:border-white/20'}`}>
                  {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
                </button>
              ))}
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {comments.length === 0 ? (
              <div className="p-8 text-center text-on-surface-variant text-sm">No comments found.</div>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="p-4 hover:bg-white/5 transition-all flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">person</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-on-surface">Comment</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sentimentColor(c.model_sentiment)}`}>
                        {c.model_sentiment ? c.model_sentiment.charAt(0).toUpperCase() + c.model_sentiment.slice(1) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant leading-relaxed">{c.original_text}</p>
                    {c.model_confidence != null && (
                      <span className="text-[10px] text-on-surface-variant/50 mt-1 inline-block">Confidence: {(c.model_confidence * 100).toFixed(0)}%</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* Chatbot Right Panel */}
      <aside className={`fixed right-0 top-0 h-full w-full lg:w-[400px] bg-slate-950 border-l border-white/5 z-50 flex flex-col shadow-2xl transition-transform duration-300 ${chatOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <span className="material-symbols-outlined text-lg">robot_2</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">🤖 Phenomenon Explorer</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">AI Analyst Assistant</p>
            </div>
          </div>
          <button className="lg:hidden text-slate-400" onClick={() => setChatOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="px-6 py-3 bg-indigo-500/5 text-[11px] text-indigo-300/80 italic border-b border-white/5">
          Menganalisis {formatNum(a.total_comments)} komentar dari "{a.video_title?.slice(0, 40)}..."
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          {messages.length === 0 && !chatMutation.isPending && (
            <div className="flex flex-col space-y-2 items-start max-w-[85%]">
              <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed border border-white/5">
                Halo! Saya telah menelaah {formatNum(a.total_comments)} komentar. Apa yang ingin Anda ketahui tentang dinamika diskusi di video ini?
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col space-y-2 ${msg.role === 'user' ? 'items-end ml-auto' : 'items-start'} max-w-[85%]`}>
              <div className={msg.role === 'user'
                ? 'abyssal-gradient text-on-primary p-4 rounded-2xl rounded-tr-none text-sm leading-relaxed shadow-lg'
                : 'bg-surface-container p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed border border-white/5'
              }>
                {msg.content}
              </div>
            </div>
          ))}

          {/* Latest bot reply with sources */}
          {chatMutation.isSuccess && chatMutation.data && (
            <>
              {chatMutation.data.sources && chatMutation.data.sources.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-2">
                  {chatMutation.data.sources.slice(0, 3).map((src, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      📎 Source {i + 1}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}

          {chatMutation.isPending && (
            <div className="flex flex-col space-y-2 items-start max-w-[85%]">
              <div className="bg-surface-container p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-900/50 border-t border-white/5">
          <div className="flex flex-wrap gap-2 mb-4">
            {['Ringkasan sentimen', 'Keluhan utama', 'Pujian terbanyak', 'Saran penonton'].map((prompt) => (
              <button key={prompt} onClick={() => handleQuickPrompt(prompt)} className="px-3 py-1.5 rounded-full border border-white/10 text-[11px] hover:bg-white/5 transition-all">
                {prompt.split(' ')[0]}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendChat} className="relative">
            <input
              className="w-full bg-surface-container-low border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-primary transition-all"
              placeholder="Tanyakan sesuatu..."
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <button type="submit" disabled={chatMutation.isPending} className="absolute right-2 top-1.5 w-9 h-9 abyssal-gradient rounded-lg flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Footer */}
      <footer className={`md:ml-64 ${chatOpen ? 'lg:mr-[400px]' : ''} py-12 border-t border-white/5 bg-slate-950 flex flex-col items-center justify-center space-y-4 w-full`}>
        <p className="text-xs uppercase tracking-widest text-slate-500">© 2024 CineSentia. Deep Ocean Analytics.</p>
      </footer>
    </div>
  );
}

export default AnalysisDetail;
