import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../supabase';

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If Supabase keys are missing, show a beautiful, helpful configuration guide
  if (!isSupabaseConfigured) {
    return (
      <div className="dark min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
              top: '-10%',
              left: '-10%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl"
            style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              bottom: '-10%',
              right: '-10%',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />
        </div>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-25px) scale(1.03); }
          }
        `}</style>

        <div className="relative z-10 w-full max-w-lg">
          <div
            className="rounded-2xl p-8 md:p-10 border border-red-500/20"
            style={{
              background: 'linear-gradient(145deg, rgba(20, 10, 15, 0.85), rgba(15, 23, 42, 0.98))',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 40px -5px rgba(239, 68, 68, 0.08)',
            }}
          >
            {/* Warning Icon */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-red-500/10 border border-red-500/20 text-red-500 animate-pulse">
                <span className="text-3xl">⚠️</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-100 font-display tracking-tight">
                Configuration Required
              </h1>
              <p className="text-slate-400 mt-2 text-sm md:text-base">
                Your local environment variables are not set up yet.
              </p>
            </div>

            {/* Guest Entry Button */}
            <div className="mb-6">
              <button
                onClick={continueAsGuest}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer text-slate-100 border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 hover:scale-[1.01] hover:border-slate-600 active:scale-[0.99] shadow-lg shadow-black/20"
              >
                <span>🚀</span>
                <span>Continue as Guest (Local/Offline Mode)</span>
              </button>
            </div>

            {/* Explainer / Steps */}
            <div className="space-y-4 text-xs text-slate-300 bg-slate-900/50 p-5 rounded-xl border border-slate-800">
              <p className="font-semibold text-red-400 text-sm">Missing configuration keys:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px]">
                <li>VITE_SUPABASE_URL</li>
                <li>VITE_SUPABASE_ANON_KEY</li>
              </ul>
              
              <div className="h-px bg-slate-800 my-3" />

              <p className="font-semibold text-slate-200">How to fix this:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                <li>Create a copy of <code className="px-1 py-0.5 rounded bg-slate-950 text-indigo-400 font-mono text-[11px]">.env.example</code> and rename it to <code className="px-1 py-0.5 rounded bg-slate-950 text-indigo-400 font-mono text-[11px]">.env</code>.</li>
                <li>Open your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">Supabase Dashboard</a>.</li>
                <li>Go to **Settings → API** and copy your **Project URL** & **anon key**.</li>
                <li>Paste them into your <code className="px-1 py-0.5 rounded bg-slate-950 text-indigo-400 font-mono text-[11px]">.env</code> file.</li>
                <li>Restart the development server.</li>
              </ol>
            </div>

            {/* Note about GitHub Actions */}
            <p className="text-center text-slate-500 text-xs mt-6 leading-relaxed">
              For live production sites, make sure you add these key-value pairs as **GitHub Secrets** under your repository settings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            top: '-10%',
            left: '-10%',
            animation: 'float 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-10 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            bottom: '-10%',
            right: '-10%',
            animation: 'float 10s ease-in-out infinite reverse',
          }}
        />
        <div
          className="absolute w-64 h-64 rounded-full opacity-8 blur-3xl"
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animation: 'float 12s ease-in-out infinite',
          }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
      `}</style>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-2xl p-8 md:p-10 border border-slate-800"
          style={{
            background: 'linear-gradient(145deg, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95))',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          {/* Logo & Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 30px -4px rgba(99, 102, 241, 0.4)',
              }}
            >
              <span className="text-3xl">📐</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-100 font-display tracking-tight">
              MathTracker
            </h1>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Your personal SSC Maths practice companion
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-3 mb-8">
            {[
              { icon: '🧠', text: 'Spaced Repetition (SRS) for smart revision' },
              { icon: '📊', text: 'Track mock tests & analytics' },
              { icon: '☁️', text: 'Cloud sync across all your devices' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Buttons container */}
          <div className="space-y-3">
            {/* Google Sign In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isLoading
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(255, 255, 255, 0.08)',
                color: '#e2e8f0',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>

            {/* Guest / Offline Mode Button */}
            <button
              onClick={continueAsGuest}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer text-slate-300 border border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60 hover:text-slate-100 hover:border-slate-700 active:scale-[0.99]"
            >
              <span>🚀</span>
              <span>Continue as Guest (Offline Mode)</span>
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-6">
            Your data is stored securely in the cloud and synced across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
