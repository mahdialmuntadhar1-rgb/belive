import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import { User } from '@supabase/supabase-js';

type UserRole = 'user' | 'business_owner';

interface SignupMetadata {
  full_name?: string;
  role?: UserRole;
  business_name?: string;
  phone?: string;
  governorate?: string;
  category?: string;
  city?: string;
  description?: string;
}

interface PendingSignupProfile {
  full_name?: string;
  role?: UserRole;
  onboarding?: {
    business_name?: string;
    phone?: string;
    governorate?: string;
    category?: string;
    city?: string;
    description?: string;
  };
}

const PENDING_SIGNUP_PREFIX = 'pending-signup-profile:';

const getPendingSignupKey = (email: string) => `${PENDING_SIGNUP_PREFIX}${email.trim().toLowerCase()}`;

const savePendingSignupProfile = (email: string, metadata?: SignupMetadata) => {
  if (typeof window === 'undefined' || !metadata) return;

  const profile: PendingSignupProfile = {
    full_name: metadata.full_name,
    role: metadata.role,
    onboarding: metadata.role === 'business_owner' ? {
      business_name: metadata.business_name,
      phone: metadata.phone,
      governorate: metadata.governorate,
      category: metadata.category,
      city: metadata.city,
      description: metadata.description,
    } : undefined,
  };

  if (!profile.full_name && !profile.role && !profile.onboarding) return;

  window.localStorage.setItem(getPendingSignupKey(email), JSON.stringify(profile));
};

const loadPendingSignupProfile = (email?: string | null): PendingSignupProfile | null => {
  if (typeof window === 'undefined' || !email) return null;

  const raw = window.localStorage.getItem(getPendingSignupKey(email));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSignupProfile;
  } catch {
    return null;
  }
};

const clearPendingSignupProfile = (email?: string | null) => {
  if (typeof window === 'undefined' || !email) return;
  window.localStorage.removeItem(getPendingSignupKey(email));
};

export function useAuth() {
  const { user, profile, setUser, setProfile, signOut: clearStore } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncProfileAfterAuth = async (currentUser: User, existingProfile: any | null) => {
    const pendingProfile = loadPendingSignupProfile(currentUser.email);
    const fullName = pendingProfile?.full_name || currentUser.user_metadata?.full_name;
    const role = pendingProfile?.role;

    if (!fullName && !role) {
      clearPendingSignupProfile(currentUser.email);
      return existingProfile;
    }

    const payload: Record<string, any> = {
      id: currentUser.id,
      updated_at: new Date().toISOString(),
    };

    if (fullName) payload.full_name = fullName;
    if (role) payload.role = role;

    const { data, error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (error) {
      console.error('Error syncing profile after auth:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return existingProfile;
    }

    clearPendingSignupProfile(currentUser.email);
    return data ?? existingProfile;
  };

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{ id: currentUser.id, created_at: new Date().toISOString() }])
            .select()
            .single();

          if (createError) {
            console.error('Error creating missing profile row:', {
              message: createError.message,
              code: createError.code,
              details: createError.details,
              hint: createError.hint,
            });
            return;
          }

          const synced = await syncProfileAfterAuth(currentUser, newProfile);
          setProfile(synced);
          return;
        }

        throw error;
      }

      const synced = await syncProfileAfterAuth(currentUser, data);
      setProfile(synced);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const signUp = async (email: string, password: string, metadata?: SignupMetadata) => {
    const safeMetadata = (metadata?.full_name || metadata?.role)
      ? {
        ...(metadata?.full_name ? { full_name: metadata.full_name } : {}),
        ...(metadata?.role ? { role: metadata.role } : {}),
      }
      : undefined;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: safeMetadata,
      },
    });

    if (error) {
      console.error('Supabase signUp failed:', {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        details: error,
      });
      const errorPayload = {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        details: error.details,
        hint: error.hint,
      };
      throw Object.assign(new Error(error.message), errorPayload);
    }

    savePendingSignupProfile(email, metadata);
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const errorPayload = {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        details: error.details,
        hint: error.hint,
      };
      throw Object.assign(new Error(error.message), errorPayload);
    }
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      const errorPayload = {
        message: error.message,
        status: error.status,
        code: error.code,
        name: error.name,
        details: error.details,
        hint: error.hint,
      };
      throw Object.assign(new Error(error.message), errorPayload);
    }
    clearStore();
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
