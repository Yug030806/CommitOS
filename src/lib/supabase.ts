import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CommitOSStore } from './store';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && anonKey) {
      return createClient(url, anonKey);
    }
    return null;
  }

  if (supabaseInstance) return supabaseInstance;

  const settings = CommitOSStore.getSettings();
  const url = settings.supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = settings.supabaseAnonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, anonKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return null;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export const SupabaseAuth = {
  isConfigured(): boolean {
    return Boolean(getSupabaseClient());
  },

  async getCurrentSession() {
    const client = getSupabaseClient();
    if (!client) return null;
    const { data } = await client.auth.getSession();
    return data.session;
  },

  async signInWithEmail(email: string, password: string) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured. Provide Supabase URL and Anon Key in Settings.');
    }
    return client.auth.signInWithPassword({ email, password });
  },

  async signUpWithEmail(email: string, password: string, fullName: string) {
    const client = getSupabaseClient();
    if (!client) {
      throw new Error('Supabase client is not configured. Provide Supabase URL and Anon Key in Settings.');
    }
    return client.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
  },

  async signOut() {
    const client = getSupabaseClient();
    if (!client) return;
    return client.auth.signOut();
  },
};
