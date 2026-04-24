import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const SESSION_KEY = '@agrilocal_session';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const persistSession = async (data) => {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to persist session:', e);
    }
  };

  const clearPersistedSession = async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (e) {
      console.error('Failed to clear session:', e);
    }
  };

  const applySession = (sessionData) => {
    console.log('DEBUG: applySession called with sessionData:', sessionData);
    setIsAuthenticated(true);
    setUserRole(sessionData.role);
    setUserData(sessionData);
  };

  // ─── Boot: check AsyncStorage first, then Supabase ──────────────────────────

  useEffect(() => {
    const bootstrap = async () => {
      try {
        // 1. Try local storage first (fast path — works offline too)
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          applySession(parsed);
          // Still verify with Supabase in the background
        }

        // 2. Verify / refresh with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) console.error('Session retrieval error:', error);

        if (session) {
          const role =
            session.user?.user_metadata?.role ||
            session.user?.user_metadata?.user_type ||
            'buyer';
          const freshData = {
            fullName: session.user?.user_metadata?.full_name || 'Guest User',
            email: session.user?.email,
            role,
          };
          await persistSession(freshData);
          applySession(freshData);
        } else if (!stored) {
          // No local session and no Supabase session
          setIsAuthenticated(false);
          setUserRole(null);
          setUserData(null);
        }
      } catch (err) {
        console.error('Auth bootstrap error:', err);
      } finally {
        // Respect the 3-second splash minimum
        setTimeout(() => setIsLoading(false), 3000);
      }
    };

    bootstrap();

    // 3. Listen for live auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);

        switch (event) {
          case 'SIGNED_IN': {
            const role =
              session?.user?.user_metadata?.role ||
              session?.user?.user_metadata?.user_type ||
              'buyer';
            const data = {
              fullName: session?.user?.user_metadata?.full_name || 'Guest User',
              email: session?.user?.email,
              role,
            };
            await persistSession(data);
            applySession(data);
            break;
          }
          case 'SIGNED_OUT':
            await clearPersistedSession();
            setIsAuthenticated(false);
            setUserRole(null);
            setUserData(null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed');
            break;
          case 'USER_UPDATED':
            if (session) {
              const role =
                session.user?.user_metadata?.role ||
                session.user?.user_metadata?.user_type ||
                'buyer';
              const data = {
                fullName: session.user?.user_metadata?.full_name || 'Guest User',
                email: session.user?.email,
                role,
              };
              await persistSession(data);
              applySession(data);
            }
            break;
          default:
            break;
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ─── Public actions ──────────────────────────────────────────────────────────

  /**
   * Called after a successful login (Supabase or guest).
   * Saves the session to AsyncStorage and updates global state.
   */
  const signIn = useCallback(async (data) => {
    console.log('DEBUG: signIn called with data:', data);
    await persistSession(data);
    applySession(data);
  }, []);

  /**
   * Clears AsyncStorage session, signs out of Supabase, resets state.
   */
  const signOut = useCallback(async () => {
    try {
      await clearPersistedSession();
      // Also clear any other app-level storage keys on logout
      await AsyncStorage.multiRemove([
        'profileImage',
        'vendorProfileImage',
        'userData',
        'vendorData',
      ]);
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    }
    // State is reset by the SIGNED_OUT listener above,
    // but set it here too for the guest-login path.
    setIsAuthenticated(false);
    setUserRole(null);
    setUserData(null);
  }, []);

  /**
   * Update userData in context + AsyncStorage (e.g. after profile edit).
   */
  const updateUserData = useCallback(async (updates) => {
    const merged = { ...userData, ...updates };
    setUserData(merged);
    await persistSession(merged);
  }, [userData]);

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isAuthenticated,
        userRole,
        userData,
        signIn,
        signOut,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
