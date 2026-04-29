import React from 'react';
import { Link } from 'react-router-dom';
import ProfileMenu from '../components/ProfileMenu';

function NotFound() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen flex flex-col">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-full mx-auto shadow-2xl shadow-black/40 font-inter tracking-tight">
        <div className="text-xl font-bold tracking-tighter text-slate-100 uppercase">CineSentia</div>
        <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link className="text-slate-400 hover:text-slate-200 transition-colors" to="/dashboard">Dashboard</Link>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">Features</a>
          <a className="text-slate-400 hover:text-slate-200 transition-colors" href="#">About</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link className="hidden sm:flex px-4 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg font-semibold hover:bg-indigo-500/20 transition-all" to="/login">Login</Link>
          <button className="p-1 text-slate-400 hover:text-slate-200 transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <ProfileMenu />
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="relative flex-grow flex items-center justify-center overflow-hidden px-6">
        {/* Ambient Background Textures */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-secondary-container/20 blur-[150px] rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-container-lowest/40 to-surface"></div>
        </div>

        {/* Simplified 404 Hero Section */}
        <div className="relative z-10 max-w-2xl w-full text-center py-20">
          <div className="inline-block mb-4">
            <h1 className="text-[12rem] md:text-[15rem] font-black tracking-tighter leading-none abyssal-glow opacity-30 select-none">
              404
            </h1>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-on-surface font-headline">
              Page Not Found
            </h2>
            <p className="text-lg md:text-xl text-on-surface-variant font-light max-w-md mx-auto leading-relaxed">
              You've drifted beyond the mapped cinematic seafloor. This coordinate doesn't exist in our charts.
            </p>
            <div className="pt-8">
              <Link className="group relative inline-flex items-center gap-2 px-10 py-4 bg-primary text-on-primary font-bold rounded-full transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(192,193,255,0.4)] active:scale-95" to="/dashboard">
                <span className="material-symbols-outlined text-xl">home</span>
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-[#464554]/15 bg-[#0b1326] relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-screen-2xl mx-auto gap-8">
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold text-[#dae2fd]">CineSentia</div>
            <p className="font-['Inter'] text-sm tracking-wide text-[#c7c4d7]">© 2024 CineSentia. Exploring the depths of cinematic data.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="font-['Inter'] text-sm tracking-wide text-[#c7c4d7] hover:text-[#dae2fd] transition-colors opacity-80 hover:opacity-100" href="#">Depth Chart</a>
            <a className="font-['Inter'] text-sm tracking-wide text-[#c7c4d7] hover:text-[#dae2fd] transition-colors opacity-80 hover:opacity-100" href="#">Submerge API</a>
            <a className="font-['Inter'] text-sm tracking-wide text-[#c7c4d7] hover:text-[#dae2fd] transition-colors opacity-80 hover:opacity-100" href="#">Privacy Protocol</a>
            <a className="font-['Inter'] text-sm tracking-wide text-[#c7c4d7] hover:text-[#dae2fd] transition-colors opacity-80 hover:opacity-100" href="#">Signal Support</a>
          </div>
          <div className="flex gap-4">
            <button className="material-symbols-outlined text-[#c7c4d7] hover:text-[#dae2fd]">language</button>
            <button className="material-symbols-outlined text-[#c7c4d7] hover:text-[#dae2fd]">database</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default NotFound;
