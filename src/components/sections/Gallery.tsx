import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Photo, Album } from '../../types/database';
import { CardHover, ButtonRipple } from '../ui/EnhancedAnimations';
import { getPreloadedData } from '../../hooks/usePreloader';

export const Gallery = memo(function Gallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Verificar cache do preloader primeiro
    const cachedData = getPreloadedData();
    if (cachedData?.photos && cachedData.photos.length > 0) {
      setPhotos(cachedData.photos as Photo[]);
      setLoading(false);
      // Carregar albums em background (não está no cache)
      supabase
        .from('albums')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) setAlbums(data);
        });
      return;
    }

    try {
      const [photosResponse, albumsResponse] = await Promise.all([
        supabase
          .from('photos')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true }),
        supabase
          .from('albums')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false }),
      ]);

      if (photosResponse.data) setPhotos(photosResponse.data);
      if (albumsResponse.data) setAlbums(albumsResponse.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayPhotos = photos.filter((p) => !selectedAlbum || p.album_id === selectedAlbum);

  const handlePrevious = useCallback(() => {
    setSelectedPhoto((prev) => {
      if (prev === null) return null;
      return prev === 0 ? displayPhotos.length - 1 : prev - 1;
    });
  }, [displayPhotos.length]);

  const handleNext = useCallback(() => {
    setSelectedPhoto((prev) => {
      if (prev === null) return null;
      return prev === displayPhotos.length - 1 ? 0 : prev + 1;
    });
  }, [displayPhotos.length]);

  return (
    <section id="gallery" className="section-padding relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -right-64 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 -left-64 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <p className="section-subtitle mb-4">Galeria</p>
          <h2 className="section-title text-4xl md:text-5xl mb-6">
            <span className="gradient-text">Momentos Capturados</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Registros dos melhores momentos em eventos, festivais e festas que já participei.
          </p>
        </AnimatedSection>

        {/* Album Filter */}
        {albums.length > 0 && (
          <AnimatedSection className="flex flex-wrap justify-center gap-3 mb-12">
            <ButtonRipple
              onClick={() => setSelectedAlbum(null)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedAlbum === null
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white neon-glow-sm'
                  : 'bg-transparent border border-purple-500/30 text-gray-400 hover:border-purple-500/50 hover:text-purple-300'
              }`}
            >
              Todos
            </ButtonRipple>
            {albums.map((album) => (
              <ButtonRipple
                key={album.id}
                onClick={() => setSelectedAlbum(album.id)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedAlbum === album.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white neon-glow-sm'
                    : 'bg-transparent border border-purple-500/30 text-gray-400 hover:border-purple-500/50 hover:text-purple-300'
                }`}
              >
                {album.title}
              </ButtonRipple>
            ))}
          </AnimatedSection>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          /* Photo Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {displayPhotos.map((photo, index) => (
              <AnimatedSection key={photo.id} delay={index * 0.05}>
                <CardHover>
                  <motion.div
                    onClick={() => setSelectedPhoto(index)}
                    className="video-thumbnail aspect-[4/3] rounded-xl overflow-hidden gradient-border p-[1px]"
                  >
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#0a0a1a]">
                      <img
                        src={photo.url}
                        alt={photo.title || 'Gallery photo'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent opacity-0 hover:opacity-100 transition-all duration-300">
                        {/* Play icon */}
                        <div className="play-icon w-14 h-14 rounded-full bg-purple-600/80 flex items-center justify-center neon-glow">
                          <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>

                        {/* Title */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-medium text-lg">
                            {photo.title || 'Sem título'}
                          </p>
                          <p className="text-purple-300 text-sm uppercase tracking-wider">
                            Clique para ver
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </CardHover>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030014]/98 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Fechar"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Previous button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.div
              key={selectedPhoto}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-[85vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={displayPhotos[selectedPhoto]?.url}
                alt={displayPhotos[selectedPhoto]?.title || 'Photo'}
                className="max-w-full max-h-[85vh] object-contain rounded-xl"
              />

              {/* Photo info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                <h3 className="text-xl font-bold text-white mb-1">
                  {displayPhotos[selectedPhoto]?.title || 'Sem título'}
                </h3>
                <p className="text-gray-400 text-sm">
                  {selectedPhoto + 1} de {displayPhotos.length}
                </p>
              </div>
            </motion.div>

            {/* Next button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Próxima foto"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Thumbnail navigation */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {displayPhotos.slice(0, 8).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  title={`Ver foto ${index + 1}`}
                  aria-label={`Ver foto ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhoto(index);
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === selectedPhoto
                      ? 'bg-purple-500 w-6'
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
});
