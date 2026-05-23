import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const { user, profile, setUser, setProfile, signOut: clearStore } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: userId, created_at: new Date().toISOString(), role: 'user' }])
            .select()
            .single();
          
          if (!createError) setProfile(newProfile);
        } else if (error.code === '42P17') {
          // Infinite recursion detected in RLS policy
          console.warn('RLS Recursion detected in profiles table. Please run the supabase_repair.sql script to fix this.');
          // Provide a minimal mock profile so the app doesn't break
          setProfile({ id: userId, role: 'user' } as any);
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      // Avoid spamming if it's a known recursion issue
      if (err && typeof err === 'object' && 'code' in err && err.code === '42P17') return;
      console.error('Error fetching profile:', err);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    clearStore();
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
}
