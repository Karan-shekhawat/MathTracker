import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { signInWithGoogle } = useAuth();
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
