import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    let mounted = true;
    let receivedAuthEvent = false;

    // Dengarkan perubahan login/logout dan refresh token dari Supabase.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      receivedAuthEvent = true;
      setSession(nextSession);
      setIsLoading(false);
    });

    // Pulihkan sesi persisten yang sebelumnya disimpan melalui SecureStore.
    void supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!mounted || receivedAuthEvent) return;
        if (error) console.warn('Gagal memulihkan sesi:', error.message);
        setSession(data.session);
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (!mounted || receivedAuthEvent) return;
        console.warn('Gagal membaca sesi AgrobioStore:', error);
        setSession(null);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) throw new Error('Supabase belum dikonfigurasi.');
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    session,
    isLoading,
    isConfigured: isSupabaseConfigured,
    signOut,
  }), [session, isLoading, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth harus digunakan di dalam AuthProvider');
  return context;
}
