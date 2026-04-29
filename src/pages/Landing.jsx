import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="overflow-x-hidden selection:bg-primary/30 min-h-screen font-body text-on-surface bg-background">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-black/40 flex justify-between items-center px-8 py-4 max-w-full mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tighter text-slate-100 font-headline">CineSentia</span>
          <div className="hidden md:flex gap-6 items-center">
            <a className="text-indigo-300 font-semibold border-b-2 border-indigo-500 pb-1 tracking-tight" href="#">Dashboard</a>
            <a className="text-slate-400 hover:text-slate-200 transition-colors tracking-tight hover:bg-white/5 px-3 py-1 rounded-lg" href="#">Features</a>
            <a className="text-slate-400 hover:text-slate-200 transition-colors tracking-tight hover:bg-white/5 px-3 py-1 rounded-lg" href="#">About</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link className="text-slate-400 hover:text-slate-200 transition-colors px-4 py-2 text-sm font-medium" to="/login">Login</Link>
          <Link className="bg-gradient-primary text-on-primary px-6 py-2 rounded-lg font-bold text-sm transition-all scale-95 active:scale-90 shadow-lg shadow-indigo-500/20" to="/register">Sign Up</Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center pt-20 px-8 overflow-hidden">
          {/* Decorative Atmosphere */}
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-tertiary-container/10 blur-[100px] rounded-full pointer-events-none"></div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                <span className="text-xs font-medium tracking-widest uppercase text-on-surface-variant font-label">Deep Ocean Analytics Engine</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-on-surface leading-[1.1] font-headline">
                Analisis Sentimen YouTube <br />
                <span className="text-gradient">Deep Learning &amp; NLP</span>
              </h1>
              <p className="text-xl text-on-surface-variant max-w-xl leading-relaxed">
                Pahami opini 10.000+ komentar dalam hitungan menit. Ekstrak emosi terdalam dari audiens Anda dengan presisi algoritma abisal.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-gradient-primary text-on-primary-container px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:shadow-primary/20 transition-all flex items-center gap-3">
                  Mulai Sekarang
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
                <button className="bg-surface-container-high text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-surface-container-highest transition-all border border-outline-variant/10">
                  Lihat Demo
                </button>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full aspect-square max-w-lg">
                {/* Simulated 3D Analytics Card */}
                <div className="absolute top-0 right-0 w-64 h-64 glass-panel rounded-2xl p-6 shadow-2xl rotate-3 transform z-20">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs text-on-surface-variant font-mono font-label">NEURAL_NET_V2</span>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#c0c1ff]"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-4/5"></div>
                    </div>
                    <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-2/3"></div>
                    </div>
                    <div className="pt-4 grid grid-cols-2 gap-2">
                      <div className="text-2xl font-bold font-headline">89.4%</div>
                      <div className="text-2xl font-bold text-indigo-400 font-headline">9.2k</div>
                    </div>
                  </div>
                </div>

                <img 
                  alt="Data visualization" 
                  className="w-full h-full object-cover rounded-[3rem] shadow-2xl opacity-80 mix-blend-lighten" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1H9R9k451aVs_pp_SadV_6kGpI58HC34cOynMqZCJ4FdCY328WdNmqgw3KTfk5wa8nsH9eGNmrOzsRvdICYknQC_rp-Pq0x7VKX5Danyn7R2adomVa7reu_rbI9mY0yOFPF4CzLGrV7sIMR3teA0eOOzGr6GKfUxkRW150v3ys4mXnt6LVWtQn4BRF7DDPCSb45ZsSPx4CBUkkltpzXqDJgF_k7G6B38tsJLc-IxNNmw43m4NHkOVN1GiJtZIelNMlrSQEnB7S_U"
                />

                <div className="absolute bottom-[-5%] left-[-10%] w-72 h-48 glass-panel rounded-2xl p-6 shadow-2xl -rotate-6 transform z-30">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="material-symbols-outlined text-primary">psychology</span>
                    <span className="text-sm font-bold font-headline">Sentiment Pulse</span>
                  </div>
                  <div className="flex items-end gap-1 h-12">
                    <div className="bg-primary/40 w-full h-[40%] rounded-sm"></div>
                    <div className="bg-primary/40 w-full h-[60%] rounded-sm"></div>
                    <div className="bg-primary w-full h-[90%] rounded-sm"></div>
                    <div className="bg-primary/40 w-full h-[50%] rounded-sm"></div>
                    <div className="bg-primary/40 w-full h-[70%] rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section className="py-24 px-8 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 text-center lg:text-left">
              <h2 className="text-4xl font-bold mb-4 font-headline">Teknologi Analisis <span className="text-gradient">Terdepan</span></h2>
              <p className="text-on-surface-variant max-w-2xl">Arsitektur deep learning kami menyelam lebih dalam ke setiap lapisan metadata komentar untuk menemukan makna yang tersembunyi.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Sentiment Analysis */}
              <div className="md:col-span-2 bg-surface-container-low rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group">
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                    <span className="material-symbols-outlined text-indigo-400">analytics</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 font-headline">Sentimen Analysis</h3>
                  <p className="text-on-surface-variant max-w-md leading-relaxed">
                    Kombinasi klasifikasi model .h5 kustom dan VADER Lexicon untuk akurasi tinggi pada teks formal maupun bahasa gaul netizen.
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 w-2/3 h-full translate-x-1/4 translate-y-1/4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'wght' 100" }}>data_thresholding</span>
                </div>
              </div>

              {/* Feature 2: Chatbot AI Explorer */}
              <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5 hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <h3 className="text-xl font-bold mb-4 font-headline">Chatbot AI Explorer</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                  Tanyakan apapun tentang isi komentar. AI kami merangkum konteks ribuan diskusi dalam satu jawaban cerdas.
                </p>
                <div className="mt-auto pt-4 border-t border-outline-variant/10 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                    <span className="material-symbols-outlined text-xs">bolt</span>
                  </div>
                  <span className="text-xs font-medium text-primary font-label">Context Aware Response</span>
                </div>
              </div>

              {/* Feature 3: Share Reports */}
              <div className="bg-surface-container rounded-3xl p-8 border border-outline-variant/5 hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-secondary">share</span>
                </div>
                <h3 className="text-xl font-bold mb-4 font-headline">Share Reports</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                  Hasil analisis siap dibagikan melalui link publik yang aman. Kirim laporan ke klien atau tim dengan satu klik.
                </p>
                <div className="mt-auto h-24 bg-surface-dim rounded-xl border border-outline-variant/10 p-3 flex items-center justify-center italic text-xs text-on-surface-variant/50">
                  cinesentia.com/report/ax72-b91...
                </div>
              </div>

              {/* Feature 4: Metric Cards */}
              <div className="md:col-span-2 bg-surface-container-high rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="flex flex-col gap-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Accuracy</span>
                  <span className="text-3xl font-bold text-primary font-headline">98.2%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Processing</span>
                  <span className="text-3xl font-bold text-primary font-headline">&lt; 2m</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Scale</span>
                  <span className="text-3xl font-bold text-primary font-headline">10k+</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-widest font-label">Uptime</span>
                  <span className="text-3xl font-bold text-primary font-headline">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto bg-surface-container-low rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(192,193,255,0.08),transparent_70%)]"></div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 font-headline">Siap Menyelami <span className="text-gradient">Data Anda?</span></h2>
              <p className="text-on-surface-variant mb-10 max-w-xl mx-auto text-lg">Dapatkan insight mendalam yang belum pernah Anda lihat sebelumnya. Mulai analisis pertama Anda hari ini.</p>
              <Link to="/register" className="inline-block bg-gradient-primary text-on-primary-container px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform">
                Coba CineSentia Gratis
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-white/5 bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="flex gap-8 mb-6">
          <a className="text-slate-600 hover:text-slate-100 transition-all text-xs uppercase tracking-widest font-label" href="#">Privacy Policy</a>
          <a className="text-slate-600 hover:text-slate-100 transition-all text-xs uppercase tracking-widest font-label" href="#">Terms of Service</a>
          <a className="text-slate-600 hover:text-slate-100 transition-all text-xs uppercase tracking-widest font-label" href="#">Support</a>
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-widest font-label">© 2024 CineSentia. Deep Ocean Analytics.</p>
        <div className="flex gap-4 pt-4">
          <span className="material-symbols-outlined text-slate-700 hover:text-primary transition-colors cursor-pointer">public</span>
          <span className="material-symbols-outlined text-slate-700 hover:text-primary transition-colors cursor-pointer">monitoring</span>
          <span className="material-symbols-outlined text-slate-700 hover:text-primary transition-colors cursor-pointer">security</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
