import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

import { Capacitor } from '@capacitor/core';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (userId === 'demo-user') {
      setProfile({ full_name: 'Demo Farmer', farm_name: 'Demo Farm' });
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data);
  };

  useEffect(() => {
    // Check active sessions
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      
      const isDemo = localStorage.getItem('isDemo') === 'true';
      if (currentUser) {
        setUser(currentUser);
        fetchProfile(currentUser.id);
      } else if (isDemo) {
        setUser({ id: 'demo-user', email: 'demo@milvexa.com' });
        setProfile({ full_name: 'Demo Farmer', farm_name: 'Demo Farm' });
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkSession();
    


    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        const isDemo = localStorage.getItem('isDemo') === 'true';
        if (isDemo) {
          setUser({ id: 'demo-user', email: 'demo@milvexa.com' });
          setProfile({ full_name: 'Demo Farmer', farm_name: 'Demo Farm' });
        } else {
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: metadata
      }
    });
    return { data, error };
  };

  const verifySignUp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup'
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (email === 'demo@milvexa.com' && password === 'demo123') {
      localStorage.setItem('isDemo', 'true');
      const demoUser = { id: 'demo-user', email: 'demo@milvexa.com' };
      setUser(demoUser);
      setProfile({ full_name: 'Demo Farmer', farm_name: 'Demo Farm' });
      return { data: { user: demoUser }, error: null };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    return { data, error };
  };

  const signInWithOtp = async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        // Allowing account creation via OTP if they aren't registered yet
        shouldCreateUser: true,
      }
    });
    return { data, error };
  };

  const verifyLoginOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink' // Or 'email' depending on Supabase version, but magiclink/email usually works for OTP login
    });
    return { data, error };
  };



  const signOut = async () => {
    localStorage.removeItem('isDemo');
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  };

  const verifyResetOtp = async (email, token) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'recovery'
    });
    return { data, error };
  };

  const updatePassword = async (newPassword) => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    return { data, error };
  };

  const loginAsDemo = () => {
    // Feature removed to prevent hardcoded bypasses
  };

  const refreshProfile = () => user && fetchProfile(user.id);

  return (
    <AuthContext.Provider value={{ 
      user, profile, signUp, verifySignUp, signIn, signInWithOtp, 
      verifyLoginOtp, signOut, 
      refreshProfile, loading, loginAsDemo, resetPassword, 
      verifyResetOtp, updatePassword 
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
