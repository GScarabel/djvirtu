import { useState, useEffect, useRef } from 'react';
import { Settings, Globe, User, Phone, MapPin } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { SiteSetting } from '../../types/database';
import toast from 'react-hot-toast';

interface SettingsForm {
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
}

const defaultSettings: SettingsForm = {
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
};

interface City {
  id: number;
  nome: string;
}

interface State {
  id: number;
  sigla: string;
  nome: string;
}

export function SettingsManager() {
  const [settings, setSettings] = useState<SettingsForm>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  // Fetch all Brazilian states from IBGE API
  const fetchStates = async (): Promise<State[]> => {
    try {
      const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const states: State[] = await response.json();
      return states.sort((a, b) => a.sigla.localeCompare(b.sigla));
    } catch (error) {
      console.error('Error fetching states:', error);
      return [];
    }
  };

  // Fetch cities for a specific state from IBGE API
  const fetchCitiesByState = async (stateSigla: string): Promise<City[]> => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateSigla}/municipios`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const cities: City[] = await response.json();
      return cities.sort((a, b) => a.nome.localeCompare(b.nome));
    } catch (error) {
      console.error(`Error fetching cities for state ${stateSigla}:`, error);
      return [];
    }
  };

  const loadCitiesForState = async (stateSigla: string) => {
    if (!stateSigla) {
      setCities([]);
      return;
    }

    setCitiesLoading(true);
    const loadedCities = await fetchCitiesByState(stateSigla);
    setCities(loadedCities);
    setCitiesLoading(false);
  };

  useEffect(() => {
    fetchSettings();
    loadStates();
  }, []);

  const loadStates = async () => {
    const loadedStates = await fetchStates();
    setStates(loadedStates);
  };

  const fetchSettings = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.from('site_settings').select('*');

      if (error) throw error;

      if (data) {
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
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    if (!isSupabaseConfigured()) return;

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key, value, type: 'text' as const }, { onConflict: 'key' });

      if (error) throw error;

      toast.success('Configuração salva automaticamente!');
    } catch (error) {
      console.error('Error saving setting:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const handleSettingChange = (field: keyof SettingsForm, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));

    // If changing state, load cities for that state
    if (field === 'location_state') {
      loadCitiesForState(value);
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveSetting(field, value);
    }, 1000);
  };

  if (!isSupabaseConfigured()) {
    return (
      <div className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 p-4 rounded-lg">
        Configure o Supabase para gerenciar configurações.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <Globe className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Informações do Site</h3>
            <p className="text-sm text-gray-400">
              Configurações gerais do site
            </p>
          </div>
        </div>

   
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
   

            <div className="form-control">
              <label className="label mb-2">
                <span className="label-text text-gray-300">Slogan</span>
              </label>
              <input
                type="text"
                value={settings.site_tagline}
                onChange={(e) =>
                  handleSettingChange('site_tagline', e.target.value)
                }
                 className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
                placeholder="Feel the Beat"
              />
            </div>
   

          <div className="form-control">
        <label className="label mb-2">
              <span className="label-text text-gray-300">Título do Hero</span>
            </label>
            <input
              type="text"
              value={settings.hero_title}
              onChange={(e) =>
                handleSettingChange('hero_title', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="DJ Nome"
            />
          </div>

          <div className="form-control">
    <label className="label mb-2">
              <span className="label-text text-gray-300">Subtítulo do Hero</span>
            </label>
            <input
              type="text"
              value={settings.hero_subtitle}
              onChange={(e) =>
                handleSettingChange('hero_subtitle', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="Transformando noites em experiências inesquecíveis"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Sobre</h3>
            <p className="text-sm text-gray-400">
              Texto da seção Sobre
            </p>
          </div>
        </div>

        <div className="form-control">
          <label className="label mb-2">
            <span className="label-text text-gray-300">Texto de apresentação</span>
          </label>
          <textarea
            value={settings.about_text}
            onChange={(e) =>
              handleSettingChange('about_text', e.target.value)
            }
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors resize-none"
            placeholder="Sua história e experiência..."
            rows={4}
          />
        </div>
      </div>

      <div className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Localização</h3>
            <p className="text-sm text-gray-400">
              Informações de localização
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300">Estado</span>
            </label>
            <select
              value={settings.location_state}
              onChange={(e) => {
                handleSettingChange('location_state', e.target.value);
                // Reset city when state changes
                handleSettingChange('location_city', '');
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
            >
              <option value="" className="bg-[#0a0a1a]">Selecione</option>
              {states.map((state) => (
                <option key={state.sigla} value={state.sigla} className="bg-[#0a0a1a]">
                  {state.nome} ({state.sigla})
                </option>
              ))}
            </select>
          </div>

          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300">Cidade</span>
            </label>
            <select
              value={settings.location_city}
              onChange={(e) => handleSettingChange('location_city', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              disabled={!settings.location_state || citiesLoading}
            >
              <option value="" className="bg-[#0a0a1a]">Selecione um estado primeiro</option>
              {citiesLoading && <option className="bg-[#0a0a1a]">Carregando cidades...</option>}
              {cities.map((city) => (
                <option key={city.id} value={city.nome} className="bg-[#0a0a1a]">
                  {city.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <Phone className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Contato</h3>
            <p className="text-sm text-gray-400">
              Informações de contato
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300">Email</span>
            </label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) =>
                handleSettingChange('contact_email', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="contato@gmail.com"
            />
          </div>

          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300">Telefone</span>
            </label>
            <input
              type="tel"
              value={settings.contact_phone}
              onChange={(e) =>
                handleSettingChange('contact_phone', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="+55 11 99999-9999"
            />
          </div>
        </div>
      </div>

      <div className="bg-[#0a0a1a]/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center">
            <Settings className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">Redes Sociais</h3>
            <p className="text-sm text-gray-400">
              Links das redes sociais
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label mb-2">
              <span className="label-text text-gray-300">Instagram</span>
            </label>
            <input
              type="url"
              value={settings.instagram_url}
              onChange={(e) =>
                handleSettingChange('instagram_url', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="https://instagram.com/usuario"
            />
          </div>

          <div className="form-control">
             <label className="label mb-2">
              <span className="label-text text-gray-300">YouTube</span>
            </label>
            <input
              type="url"
              value={settings.youtube_url}
              onChange={(e) =>
                handleSettingChange('youtube_url', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="https://youtube.com/@usuario"
            />
          </div>

          <div className="form-control">
           <label className="label mb-2">
              <span className="label-text text-gray-300">SoundCloud</span>
            </label>
            <input
              type="url"
              value={settings.soundcloud_url}
              onChange={(e) =>
                handleSettingChange('soundcloud_url', e.target.value)
              }
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-purple-500/20 text-white focus:border-purple-500/50 focus:outline-none transition-colors"
              placeholder="https://soundcloud.com/usuario"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
