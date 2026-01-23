import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialCheckDone = false;

    // Debug helpers for Stripe redirect/session restoration issues
    const debugPrefix = '[AUTH]';
    try {
      // Don't log tokens; just whether storage appears to contain something
      const keys = Object.keys(localStorage);
      const sbKey = keys.find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
      console.log(debugPrefix, 'mount', {
        origin: window.location.origin,
        path: window.location.pathname + window.location.search,
        hasSbAuthKey: Boolean(sbKey),
      });
    } catch {
      // ignore
    }
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log(debugPrefix, 'onAuthStateChange', {
          event,
          initialCheckDone,
          hasSession: Boolean(newSession),
          userId: newSession?.user?.id ?? null,
        });

        // Only update state after initial session check is done
        // This prevents race conditions where onAuthStateChange fires with null
        // before getSession() has restored the session from storage
        if (initialCheckDone) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        }
      }
    );

    // Check for existing session from storage
    supabase.auth.getSession().then(({ data: { session: existingSession }, error }) => {
      console.log(debugPrefix, 'getSession resolved', {
        hasSession: Boolean(existingSession),
        userId: existingSession?.user?.id ?? null,
        error: error ? { name: error.name, message: error.message } : null,
      });

      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      initialCheckDone = true;
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?mode=reset`,
    });
    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword }}>
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
