import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface PreloadState {
  progress: number;
  status: string;
  isComplete: boolean;
}

interface PreloadedData {
  settings: Record<string, unknown> | null;
  photos: unknown[];
  videos: unknown[];
  events: unknown[];
}

// Cache global para dados pré-carregados
let preloadedDataCache: PreloadedData | null = null;

export function getPreloadedData(): PreloadedData | null {
  return preloadedDataCache;
}

export function usePreloader() {
  const [state, setState] = useState<PreloadState>({
    progress: 0,
    status: 'Iniciando...',
    isComplete: false,
  });

  const updateProgress = useCallback((progress: number, status: string) => {
    setState({ progress, status, isComplete: progress >= 100 });
  }, []);

  useEffect(() => {
    const preload = async () => {
      try {
        // Step 1: Fontes (10%)
        updateProgress(5, 'Carregando fontes...');
        await preloadFonts();
        updateProgress(15, 'Fontes carregadas');

        // Step 2: Dados do Supabase (60%)
        if (isSupabaseConfigured()) {
          updateProgress(20, 'Conectando ao servidor...');

          // Carregar settings
          updateProgress(25, 'Carregando configurações...');
          const settingsData = await preloadSettings();

          // Carregar fotos
          updateProgress(35, 'Carregando galeria...');
          const photosData = await preloadPhotos();

          // Carregar vídeos
          updateProgress(50, 'Carregando vídeos...');
          const videosData = await preloadVideos();

          // Carregar eventos
          updateProgress(60, 'Carregando eventos...');
          const eventsData = await preloadEvents();

          // Salvar no cache
          preloadedDataCache = {
            settings: settingsData,
            photos: photosData,
            videos: videosData,
            events: eventsData,
          };

          updateProgress(70, 'Dados carregados');
        } else {
          updateProgress(70, 'Modo offline');
        }

        // Step 3: Pré-carregar imagens críticas (90%)
        updateProgress(75, 'Preparando imagens...');
        await preloadCriticalImages();
        updateProgress(90, 'Imagens prontas');

        // Step 4: Finalização
        updateProgress(95, 'Finalizando...');

        // Pequeno delay para animação suave
        await new Promise((resolve) => setTimeout(resolve, 300));
        updateProgress(100, 'Pronto!');

      } catch (error) {
        console.error('Erro no preload:', error);
        // Em caso de erro, continua assim mesmo
        updateProgress(100, 'Pronto!');
      }
    };

    preload();
  }, [updateProgress]);

  return state;
}

// Pré-carregar fontes
async function preloadFonts(): Promise<void> {
  // Verifica se as fontes já estão carregadas
  if (document.fonts) {
    try {
      await Promise.race([
        document.fonts.ready,
        new Promise((resolve) => setTimeout(resolve, 2000)), // Timeout de 2s
      ]);
    } catch {
      // Ignora erros de fonte
    }
  }
}

// Pré-carregar settings
async function preloadSettings(): Promise<Record<string, unknown> | null> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .single();
    return data;
  } catch {
    return null;
  }
}

// Pré-carregar fotos
async function preloadPhotos(): Promise<unknown[]> {
  try {
    const { data } = await supabase
      .from('photos')
      .select('*')
      .eq('is_published', true)
      .order('display_order', { ascending: true })
      .limit(12); // Limita para não sobrecarregar
    return data || [];
  } catch {
    return [];
  }
}

// Pré-carregar vídeos
async function preloadVideos(): Promise<unknown[]> {
  try {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('is_published', true)
      .order('is_featured', { ascending: false })
      .order('display_order', { ascending: true })
      .limit(6);
    return data || [];
  } catch {
    return [];
  }
}

// Pré-carregar eventos
async function preloadEvents(): Promise<unknown[]> {
  try {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .order('event_date', { ascending: true })
      .limit(10);
    return data || [];
  } catch {
    return [];
  }
}

// Pré-carregar imagens críticas
async function preloadCriticalImages(): Promise<void> {
  // Lista de imagens críticas para pré-carregar
  const criticalImages: string[] = [];

  // Adiciona thumbnails de fotos do cache
  if (preloadedDataCache?.photos) {
    const photoUrls = (preloadedDataCache.photos as Array<{ url?: string }>)
      .slice(0, 6)
      .map((p) => p.url)
      .filter((url): url is string => typeof url === 'string');
    criticalImages.push(...photoUrls);
  }

  // Adiciona thumbnails de vídeos do cache
  if (preloadedDataCache?.videos) {
    const videoThumbnails = (preloadedDataCache.videos as Array<{ thumbnail_url?: string }>)
      .slice(0, 3)
      .map((v) => v.thumbnail_url)
      .filter((url): url is string => typeof url === 'string');
    criticalImages.push(...videoThumbnails);
  }

  // Pré-carregar as imagens
  await Promise.allSettled(
    criticalImages.map((src) => preloadImage(src))
  );
}

// Função auxiliar para pré-carregar uma imagem
function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = src;

    // Timeout de 3 segundos por imagem
    setTimeout(() => resolve(), 3000);
  });
}
