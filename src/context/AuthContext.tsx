import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database';

type AuthContextValue = {
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchAdminProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  const profile = data as Profile | null;
  if (!profile?.is_admin) return null;
  return profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const adminProfile = await fetchAdminProfile(session.user.id);
      if (!adminProfile) {
        await supabase.auth.signOut();
        setProfile(null);
      } else {
        setProfile(adminProfile);
      }
    } catch {
      await supabase.auth.signOut();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        const adminProfile = await fetchAdminProfile(session.user.id);
        if (!adminProfile) {
          await supabase.auth.signOut();
          setProfile(null);
        } else {
          setProfile(adminProfile);
        }
      } catch {
        await supabase.auth.signOut();
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.functions.invoke('admin-login', {
      body: { email, password },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });

    if (sessionError) throw sessionError;

    const adminProfile = await fetchAdminProfile(data.user.id);
    if (!adminProfile) {
      await supabase.auth.signOut();
      throw new Error('Not authorized. Admin access only.');
    }
    setProfile(adminProfile);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({ profile, loading, signIn, signOut }),
    [profile, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
