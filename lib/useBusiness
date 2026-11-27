'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export const DEFAULT_SETTINGS = {
  business_name: '',
  currency: '₹',
  business_type: null,
  default_margin: 40,
  pricing_mode: 'margin',
  round_to: 0,
  hourly_rate: 0,
};

// Signed-in user + business settings, shared by Materials / Products / Settings.
export function useBusiness() {
  const [session, setSession] = useState(undefined); // undefined = checking, null = signed out
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === null) window.location.href = '/login';
  }, [session]);

  const reloadSettings = useCallback(async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from('business_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle();
    setSettings({ ...DEFAULT_SETTINGS, ...(data || {}) });
  }, [session]);

  useEffect(() => {
    reloadSettings();
  }, [reloadSettings]);

  return { session, settings, reloadSettings, ready: !!session && !!settings };
}
