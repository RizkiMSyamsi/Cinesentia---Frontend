import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthPage({ initiallyLogin = true }) {
  const [isLogin, setIsLogin] = useState(initiallyLogin);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(fullName, email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      const message =
        err.response?.data?.error ||
        (isLogin ? 'Invalid email or password.' : 'Registration failed. Please try again.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset error when switching tabs
  const switchTab = (toLogin) => {
    setIsLogin(toLogin);
    setError('');
  };

  return (
    <>
      {/* Background gradients and elements (Combining aesthetics from both pages) */}
      <div className="fixed inset-0 gradient-bg z-0 pointer-events-none"></div>
      <div className="fixed -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-[120px] z-0 pointer-events-none"></div>
      <div className="fixed -bottom-24 -right-24 w-[500px] h-[500px] bg-secondary-container/20 rounded-full blur-[140px] z-0 pointer-events-none"></div>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl flex justify-between items-center px-8 py-4 max-w-full mx-auto shadow-2xl shadow-black/40">
        <div className="text-xl font-bold tracking-tighter text-slate-100 font-headline uppercase">
          CineSentia
        </div>
        <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link className="text-slate-400 hover:text-slate-200 transition-colors font-body text-sm font-medium hidden sm:block" to="/dashboard">Dashboard</Link>
          <a className="text-slate-400 hover:text-slate-200 transition-colors font-body text-sm font-medium hidden sm:block" href="#">Features</a>
          <a className="text-slate-400 hover:text-slate-200 transition-colors font-body text-sm font-medium hidden sm:block" href="#">About</a>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-[480px] mx-auto mt-24 mb-16 lg:mt-0 flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full glass-panel rounded-xl p-8 md:p-12 shadow-2xl border border-white/5 relative">

          <header className="flex flex-col items-center mb-10 text-center">
            {isLogin ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">🎬</span>
                  <h1 className="text-3xl font-black tracking-tighter text-on-surface uppercase font-headline">CineSentia</h1>
                </div>
                <p className="text-on-surface-variant text-sm font-label tracking-wide">Deep Ocean Movie Analytics</p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold tracking-tighter text-on-surface mb-2 font-headline">Begin Exploration</h1>
                <p className="text-on-surface-variant font-body text-sm">Join the abyssal curator for deep-sea cinematic analytics.</p>
              </>
            )}
          </header>

          {/* Toggle Navigation Tab (From Login Layout) */}
          <nav className="flex w-full mb-8 bg-surface-container-low p-1 rounded-lg">
            <button
              onClick={() => switchTab(true)}
              className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${isLogin ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Login
            </button>
            <button
              onClick={() => switchTab(false)}
              className={`flex-1 text-center py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${!isLogin ? 'bg-surface-container text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Register
            </button>
          </nav>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Full Name Field (Only for Register) */}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-xs font-label uppercase tracking-widest text-primary font-semibold ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">person</span>
                  <input
                    className="w-full bg-surface-container-low border border-outline-variant/15 rounded-lg py-3.5 pl-12 pr-4 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none font-body"
                    placeholder="Commander Shepard"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    minLength={2}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-1" htmlFor="email">
                {!isLogin ? (
                  <span className="text-primary font-semibold">Email Address</span>
                ) : (
                  "Email"
                )}
              </label>
              <div className="relative">
                {!isLogin && <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">alternate_email</span>}
                <input
                  className={`w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors font-body ${!isLogin ? 'pl-12' : ''}`}
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest" htmlFor="password">
                  {!isLogin ? (
                    <span className="text-primary font-semibold">Secure Password</span>
                  ) : (
                    "Password"
                  )}
                </label>
                {isLogin && (
                  <a className="text-[10px] font-bold text-primary-fixed-dim hover:text-primary transition-colors uppercase tracking-wider" href="#">Lupa Password?</a>
                )}
              </div>
              <div className="relative">
                {!isLogin && <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline-variant text-lg">lock</span>}
                <input
                  className={`w-full bg-surface-container-low border border-outline-variant/15 rounded-lg px-4 py-3.5 text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary transition-colors font-body ${!isLogin ? 'pl-12' : ''}`}
                  id="password"
                  placeholder="••••••••••••"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                {isLogin && (
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Remember Me (Only Login) */}
            {isLogin && (
              <div className="flex items-center space-x-3 px-1">
                <input
                  className="w-4 h-4 rounded border-outline-variant/30 bg-surface-container-low text-primary focus:ring-primary focus:ring-offset-surface-dim"
                  id="remember"
                  type="checkbox"
                />
                <label className="text-sm text-on-surface-variant font-label" htmlFor="remember">Ingat saya untuk 30 hari</label>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <button
                className={`w-full py-4 rounded-lg text-on-primary font-bold tracking-wide shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${isLogin ? 'btn-primary-gradient text-sm active:scale-[0.98] shadow-primary-container/20' : 'abyssal-gradient text-on-primary-container hover:scale-[1.02] active:scale-[0.98] shadow-primary-container/20'} ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{isLogin ? 'Memproses...' : 'Mendaftar...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isLogin ? 'Masuk' : 'Register'}</span>
                    {!isLogin && <span className="material-symbols-outlined text-lg">arrow_forward</span>}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Login Extra Utilities */}
          {isLogin && (
            <div className="mt-10 flex flex-col items-center space-y-6">
              <p className="text-sm text-on-surface-variant font-label">
                Belum punya akun? <button className="text-primary font-bold hover:underline ml-1" onClick={() => switchTab(false)}>Daftar di sini</button>
              </p>
            </div>
          )}

          {/* Register Extra Utilities */}
          {!isLogin && (
            <>
              <div className="mt-8 text-center">
                <p className="text-on-surface-variant text-sm font-body">
                  Already part of the fleet?
                  <button className="text-primary font-semibold hover:underline decoration-primary/30 underline-offset-4 ml-1" onClick={() => switchTab(true)}>Log in here</button>
                </p>
              </div>

              <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-surface-container-highest px-3 py-1.5 rounded-full border border-white/5">
                <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#c0c1ff]"></div>
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Secure Node</span>
              </div>
            </>
          )}
        </div>

        {/* Register Support Marks */}
        {!isLogin && (
          <div className="w-full max-w-md mt-6 flex justify-between items-center opacity-40 px-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">verified_user</span>
              <span className="text-[10px] uppercase tracking-tighter">Encrypted Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">database</span>
              <span className="text-[10px] uppercase tracking-tighter">Oceanic Data Sovereignty</span>
            </div>
          </div>
        )}

      </main>

      {/* Floating Insights (From Login Page) */}
      <div className="fixed top-24 right-12 hidden lg:block z-20 pointer-events-none">
        <div className="flex items-start gap-4 p-4 glass-panel rounded-lg max-w-[240px]">
          <div className="w-2 h-2 rounded-full bg-primary mt-1 shadow-[0_0_8px_rgba(192,193,255,0.8)]"></div>
          <div>
            <p className="text-[10px] font-bold text-on-surface uppercase tracking-wider mb-1">Abyssal Insight</p>
            <p className="text-xs text-on-surface-variant leading-relaxed">Analisis sentimen terkini menunjukkan tren positif untuk genre Sci-Fi di kuartal ini.</p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-12 left-12 hidden lg:block z-20 pointer-events-none">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">Latensi</span>
            <span className="text-sm font-mono text-primary">24ms</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-outline uppercase tracking-[0.3em]">Status</span>
            <span className="text-sm font-mono text-primary">Operasional</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto text-center py-6 w-full relative z-20 bg-surface/50 backdrop-blur-md">
        <p className="text-[10px] text-outline/40 uppercase tracking-[0.2em] font-medium">
          © 2024 CineSentia. Protected by Abyssal Security.
        </p>
      </footer>
    </>
  );
}

export default AuthPage;
