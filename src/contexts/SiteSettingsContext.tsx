import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SiteSetting } from '../types/database';
import { getPreloadedData } from '../hooks/usePreloader';

interface SiteSettings {
  site_name: string;
  site_tagline: string;
  hero_title: string;
  hero_subtitle: string;
  about_text: string;
  contact_email: string;
  contact_phone: string;
  location_city: string;
  location_state: string;
  instagram_url: string;
  youtube_url: string;
  soundcloud_url: string;
  spotify_url: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SiteSettings = {
  site_name: '',
  site_tagline: '',
  hero_title: '',
  hero_subtitle: '',
  about_text: '',
  contact_email: '',
  contact_phone: '',
  location_city: '',
  location_state: '',
  instagram_url: '',
  youtube_url: '',
  soundcloud_url: '',
  spotify_url: '',
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const applySettingsData = (data: SiteSetting[]) => {
    const settingsMap: Record<string, string> = {};
    data.forEach((setting: SiteSetting) => {
      settingsMap[setting.key] = setting.value || '';
    });

    setSettings({
      site_name: settingsMap.site_name || defaultSettings.site_name,
      site_tagline: settingsMap.site_tagline || defaultSettings.site_tagline,
      hero_title: settingsMap.hero_title || defaultSettings.hero_title,
      hero_subtitle: settingsMap.hero_subtitle || defaultSettings.hero_subtitle,
      about_text: settingsMap.about_text || defaultSettings.about_text,
      contact_email: settingsMap.contact_email || defaultSettings.contact_email,
      contact_phone: settingsMap.contact_phone || defaultSettings.contact_phone,
      location_city: settingsMap.location_city || defaultSettings.location_city,
      location_state: settingsMap.location_state || defaultSettings.location_state,
      instagram_url: settingsMap.instagram_url || '',
      youtube_url: settingsMap.youtube_url || '',
      soundcloud_url: settingsMap.soundcloud_url || '',
      spotify_url: settingsMap.spotify_url || '',
    });
  };

  const fetchSettings = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Verificar cache do preloader primeiro
    const cachedData = getPreloadedData();
    if (cachedData?.settings) {
      const settingsArray = Array.isArray(cachedData.settings)
        ? cachedData.settings as SiteSetting[]
        : [cachedData.settings as unknown as SiteSetting];
      applySettingsData(settingsArray);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('site_settings').select('*');

      if (error) throw error;

      if (data) {
        applySettingsData(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    setLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();

    // Listen for real-time changes to settings
    if (isSupabaseConfigured()) {
      const channel = supabase
        .channel('realtime-settings')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'site_settings',
          },
          (payload) => {
            setSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'site_settings',
          },
          (payload) => {
            setSettings(prev => ({
              ...prev,
              [payload.new.key]: payload.new.value
            }));
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}
