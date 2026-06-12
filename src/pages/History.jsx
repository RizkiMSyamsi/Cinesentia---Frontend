import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ProfileMenu from '../components/ProfileMenu';

function History() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all analyses
  const { data: analysesData, isLoading } = useQuery({
    queryKey: ['analyses', page, statusFilter],
    queryFn: async () => {
      let url = `/analyses?page=${page}&limit=9`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }
      const { data } = await api.get(url);
      return data;
    },
  });

  const analyses = analysesData?.analyses ?? [];
  const totalPages = analysesData?.pages ?? 1;
  const totalItems = analysesData?.total ?? 0;

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format number helper
  const formatNumber = (n) => {
    if (!n) return '0';
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return n.toString();
  };

  // Determine dominant sentiment for badge
  const getDominantSentiment = (a) => {
    const max = Math.max(a.positive_pct || 0, a.negative_pct || 0, a.neutral_pct || 0);
    if (max === a.positive_pct) return { label: `${Math.round(a.positive_pct)}% Positif`, color: 'green' };
    if (max === a.negative_pct) return { label: `${Math.round(a.negative_pct)}% Negatif`, color: 'red' };
    return { label: `${Math.round(a.neutral_pct)}% Netral`, color: 'primary' };
  };

  // Client-side search filtering
  const filteredAnalyses = analyses.filter((analysis) => {
    const titleMatch = (analysis.video_title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const channelMatch = (analysis.channel_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || channelMatch;
  });

  return (
    <div className="overflow-x-hidden overflow-y-auto min-h-screen font-body text-on-surface bg-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-full mx-auto shadow-2xl shadow-black/40">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <Link to="/dashboard" className="text-xl font-bold tracking-tighter text-slate-100 font-headline">CineSentia</Link>
        </div>
        <div className="flex items-center space-x-4">
          <ProfileMenu />
        </div>
      </nav>

      {/* SideNavBar */}
      <aside className={`fixed left-0 top-0 h-full w-64 z-40 bg-slate-900 text-sm flex flex-col py-20 border-r border-white/5 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} hidden lg:flex`}>
        <div className="px-6 mb-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl primary-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-on-primary">psychology</span>
            </div>
            <div>
              <h2 className="text-slate-100 font-black text-base font-headline">AI Explorer</h2>
              <p className="text-slate-500 text-xs font-label">Deep Dive Analysis</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/dashboard">
            <span className="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/analyze">
            <span className="material-symbols-outlined">add_circle</span>
            <span>New Analysis</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-indigo-500/10 text-indigo-400 border-r-4 border-indigo-500 transition-all font-label" to="/history">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
            <span>Riwayat</span>
          </Link>
          <Link className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all font-label" to="/profile">
            <span className="material-symbols-outlined">person</span>
            <span>Profile</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content Canvas */}
      <main className={`pt-28 pb-20 md:pb-12 px-6 md:px-12 min-h-screen bg-surface transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2 font-headline">Riwayat Analisis 📜</h1>
          <p className="text-on-surface-variant text-lg">Kelola dan lihat kembali hasil sentiment analysis video trailer film Anda.</p>
        </header>

        {/* Filters and Search Bar */}
        <section className="mb-8 flex flex-col md:flex-row justify-between gap-4">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'completed', label: 'Selesai' },
              { id: 'failed', label: 'Gagal' },
              { id: 'queued', label: 'Mengantri' },
              { id: 'fetching', label: 'Scraping' },
              { id: 'analyzing', label: 'Menganalisis' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setStatusFilter(filter.id); setPage(1); }}
                className={`text-xs px-4 py-2 rounded-full border transition-all font-semibold ${
                  statusFilter === filter.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-white/10 text-on-surface-variant hover:border-white/20'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <input
              type="text"
              placeholder="Cari judul film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/15 rounded-xl py-2 pl-4 pr-10 text-sm focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-outline/50 font-body text-on-surface"
            />
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-md">
              search
            </span>
          </div>
        </section>

        {/* History Bento List */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 shadow-lg">
                  <div className="relative h-48 bg-surface-container-high animate-pulse overflow-hidden flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary/40 text-5xl animate-spin">sync</span>
                  </div>
                  <div className="p-6">
                    <div className="h-6 w-3/4 bg-surface-container-high rounded-full mb-3 animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-surface-container-high rounded-full mb-6 animate-pulse"></div>
                  </div>
                </div>
              ))
            ) : filteredAnalyses.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">history</span>
                <h4 className="text-xl font-bold text-on-surface mb-2">Tidak ditemukan riwayat analisis</h4>
                <p className="text-on-surface-variant text-sm max-w-md mx-auto">
                  {searchQuery ? 'Coba cari dengan kata kunci lain atau ubah filter status Anda.' : 'Anda belum pernah melakukan analisis video film trailer.'}
                </p>
              </div>
            ) : (
              filteredAnalyses.map((analysis) => {
                const isProcessing = analysis.status !== 'completed' && analysis.status !== 'failed';

                if (isProcessing) {
                  return (
                    <Link to={`/analyze?id=${analysis.id}`} key={analysis.id} className="bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/5 shadow-lg group hover:scale-[1.01] duration-200">
                      <div className="relative h-48 bg-surface-container-high animate-pulse overflow-hidden flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary/40 text-5xl animate-spin">sync</span>
                        <div className="absolute bottom-4 left-4 bg-surface-dim/80 backdrop-blur px-3 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-widest font-label">
                          {analysis.status === 'failed' ? 'Failed' : 'Processing'}
                        </div>
                      </div>
                      <div className="p-6">
                        <h4 className="text-on-surface font-bold text-lg mb-1 line-clamp-1 font-headline">{analysis.video_title || 'Menganalisis...'}</h4>
                        <p className="text-on-surface-variant text-sm mb-3">{analysis.progress}% selesai</p>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                          <div className="primary-gradient h-full rounded-full transition-all duration-300" style={{ width: `${analysis.progress}%` }}></div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                if (analysis.status === 'failed') {
                  return (
                    <div key={analysis.id} className="bg-surface-container rounded-xl overflow-hidden border border-red-500/10 shadow-lg p-6 flex flex-col justify-between min-h-[220px]">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 font-label flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                            Gagal
                          </span>
                          <span className="text-xs text-on-surface-variant font-label">{formatDate(analysis.created_at)}</span>
                        </div>
                        <h4 className="text-on-surface font-bold text-lg mb-2 line-clamp-1 font-headline">{analysis.video_title || 'Analisis Gagal'}</h4>
                        <p className="text-xs text-on-surface-variant/80 line-clamp-2">{analysis.error_message || 'Terjadi kesalahan internal pada pipeline model.'}</p>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-outline-variant/10">
                        <Link to="/analyze" className="text-xs text-primary font-bold hover:underline flex items-center font-label">
                          Ulangi Analisis
                          <span className="material-symbols-outlined ml-1 text-sm">replay</span>
                        </Link>
                      </div>
                    </div>
                  );
                }

                const sentiment = getDominantSentiment(analysis);
                const sentimentColors = {
                  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', dot: 'bg-green-500', glow: 'shadow-[0_0_8px_rgba(34,197,94,0.8)]' },
                  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', dot: 'bg-red-500', glow: '' },
                  primary: { bg: 'bg-primary/20', text: 'text-primary', border: 'border-primary/30', dot: 'bg-primary', glow: 'shadow-[0_0_8px_#c0c1ff]' },
                };
                const sc = sentimentColors[sentiment.color];

                return (
                  <Link to={`/analysis/${analysis.id}`} key={analysis.id} className="bg-surface-container rounded-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300 border border-outline-variant/5 shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      {analysis.thumbnail_url ? (
                        <img alt={analysis.video_title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={analysis.thumbnail_url} />
                      ) : (
                        <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">movie</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface-dim/90 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <div className={`${sc.bg} ${sc.text} backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold ${sc.border} border flex items-center font-label`}>
                          <span className={`w-2 h-2 rounded-full ${sc.dot} mr-2 ${sc.glow}`}></span>
                          {sentiment.label}
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h4 className="text-on-surface font-bold text-lg mb-1 line-clamp-1 font-headline">{analysis.video_title || 'Untitled'}</h4>
                      <p className="text-on-surface-variant text-sm mb-6">{formatDate(analysis.created_at)} • {formatNumber(analysis.total_comments)} Komentar</p>
                      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                          <span className="material-symbols-outlined text-sm">person</span>
                          {analysis.channel_name || 'Unknown'}
                        </div>
                        <span className="text-sm font-bold text-primary flex items-center group-hover:translate-x-1 transition-transform font-label">
                          Lihat Detail
                          <span className="material-symbols-outlined ml-1 text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>

        {/* Paginator */}
        {totalPages > 1 && (
          <section className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface transition-all flex items-center ${
                page === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-400'
              }`}
            >
              <span className="material-symbols-outlined text-md">chevron_left</span>
            </button>
            <span className="text-sm text-on-surface-variant font-semibold px-4 font-label">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-xl bg-surface-container border border-outline-variant/10 text-on-surface transition-all flex items-center ${
                page === totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-indigo-500/10 hover:text-indigo-400'
              }`}
            >
              <span className="material-symbols-outlined text-md">chevron_right</span>
            </button>
          </section>
        )}
      </main>

      {/* Universal CineSentia Footer */}
      <footer className={`border-t border-white/5 bg-[#070d19] py-12 px-8 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="text-lg font-bold tracking-tight text-[#dae2fd] uppercase font-headline">CineSentia</span>
            <p className="text-xs text-slate-500 font-label">© 2024 CineSentia. Deep Ocean Cinematic Sentiment Analytics.</p>
          </div>
          <div className="flex gap-8 text-xs font-label">
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Privacy Policy</Link>
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Terms of Service</Link>
            <Link className="text-slate-400 hover:text-indigo-400 transition-colors uppercase tracking-wider" to="/">Support</Link>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/5 flex justify-around items-center py-4 px-6 z-50">
        <Link className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" to="/dashboard">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">dashboard</span>
          <span className="text-[10px] font-label">Dashboard</span>
        </Link>
        <Link className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" to="/analyze">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">add_circle</span>
          <span className="text-[10px] font-label">Analyze</span>
        </Link>
        <Link className="flex flex-col items-center space-y-1 text-indigo-400 group" to="/history">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform" style={{ fontVariationSettings: "'FILL' 1" }}>history</span>
          <span className="text-[10px] font-bold font-label">Riwayat</span>
        </Link>
        <Link className="flex flex-col items-center space-y-1 text-slate-500 hover:text-slate-300 transition-colors group" to="/profile">
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">person</span>
          <span className="text-[10px] font-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
}

export default History;
