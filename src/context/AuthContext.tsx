import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabase';

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem('math_tracker_guest_mode') === 'true';
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
          localStorage.removeItem('math_tracker_guest_mode');
        }
        if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Handle OAuth hash fragment: when Google redirects back with
    // #access_token=...&refresh_token=..., manually extract the tokens
    // and create a session. This is more reliable than relying on the
    // Supabase client's automatic detectSessionInUrl.
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if (accessToken && refreshToken) {
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        }).then(({ data, error }) => {
          if (!error && data.session) {
            setUser(data.session.user);
            setIsGuest(false);
            localStorage.removeItem('math_tracker_guest_mode');
          } else if (error) {
            console.error('Failed to set session from URL hash:', error);
          }
          // Clean up the URL hash fragment
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
          setLoading(false);
        });
      } else {
        // Hash has access_token key but missing values — clean up and continue
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
        setLoading(false);
      }
    } else {
      // No hash fragment — check for an existing session (e.g. page refresh)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          setUser(session.user);
          setIsGuest(false);
          localStorage.removeItem('math_tracker_guest_mode');
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Failed to get session:', err);
        setLoading(false);
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured. Please define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + (import.meta.env.BASE_URL || '/'),
      },
    });
    if (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Email sign-in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + (import.meta.env.BASE_URL || '/'),
      },
    });
    if (error) {
      console.error('Email sign-up error:', error);
      throw error;
    }
    // If email confirmation is required, user won't be signed in yet
    if (data?.user && !data.session) {
      throw new Error('CHECK_EMAIL');
    }
  };

  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + (import.meta.env.BASE_URL || '/'),
      },
    });
    if (error) {
      console.error('Magic link error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    setIsGuest(false);
    localStorage.removeItem('math_tracker_guest_mode');
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem('math_tracker_guest_mode', 'true');
  };

  return (
    <AuthContext.Provider value={{
      user, isGuest, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signInWithMagicLink,
      signOut, continueAsGuest,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
