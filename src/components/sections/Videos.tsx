import { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { Video } from '../../types/database';
import { CardHover } from '../ui/EnhancedAnimations';
import { getPreloadedData } from '../../hooks/usePreloader';

export const Videos = memo(function Videos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    // Verificar cache do preloader primeiro
    const cachedData = getPreloadedData();
    if (cachedData?.videos && cachedData.videos.length > 0) {
      setVideos(cachedData.videos as Video[]);
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('display_order', { ascending: true });

      if (data) setVideos(data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayVideos = videos;

  const getVideoEmbedUrl = useCallback((video: Video) => {
    if (video.video_type === 'youtube' && video.external_id) {
      return `https://www.youtube.com/embed/${video.external_id}?autoplay=1`;
    }
    if (video.video_type === 'vimeo' && video.external_id) {
      return `https://player.vimeo.com/video/${video.external_id}?autoplay=1`;
    }
    return video.url;
  }, []);

  const handleCloseVideo = useCallback(() => {
    setSelectedVideo(null);
  }, []);

  const featuredVideo = displayVideos.find((v) => v.is_featured);
  const otherVideos = displayVideos.filter((v) => !v.is_featured);

  return (
    <section id="videos" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <AnimatedSection className="text-center mb-16">
          <p className="section-subtitle mb-4">Showreel</p>
          <h2 className="section-title text-4xl md:text-5xl mb-6">
            <span className="gradient-text">Sets & Performances</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Confira meus melhores momentos em vídeo. Sets completos, performances ao vivo e muito mais.
          </p>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Featured Video */}
            {featuredVideo && (
              <AnimatedSection className="mb-12">
                <CardHover>
                  <motion.div
                    onClick={() => setSelectedVideo(featuredVideo)}
                    className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group gradient-border p-[1px]"
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                      <img
                        src={featuredVideo.thumbnail_url || 'https://picsum.photos/seed/featured/1280/720'}
                        alt={featuredVideo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-[#030014]/40 to-transparent" />

                      {/* Play button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                          initial={{ scale: 1 }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center neon-glow group-hover:animate-pulse-glow"
                        >
                          <Play className="w-10 h-10 text-white ml-1" fill="white" />
                        </motion.div>
                      </div>

                      {/* Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <span className="inline-block px-4 py-1 rounded-full bg-purple-600/80 text-white text-xs font-medium uppercase tracking-wider mb-4">
                          Destaque
                        </span>
                        <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                          {featuredVideo.title}
                        </h3>
                        <p className="text-gray-300 max-w-2xl text-lg">
                          {featuredVideo.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </CardHover>
              </AnimatedSection>
            )}

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherVideos.map((video, index) => (
                <AnimatedSection key={video.id} delay={index * 0.1}>
                  <CardHover>
                    <motion.div
                      onClick={() => setSelectedVideo(video)}
                      className="video-thumbnail rounded-xl overflow-hidden cursor-pointer group glass-card"
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnail_url || 'https://picsum.photos/seed/video/800/450'}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />

                        {/* Play icon */}
                        <div className="play-icon w-16 h-16 rounded-full bg-purple-600/90 flex items-center justify-center neon-glow-sm">
                          <Play className="w-7 h-7 text-white ml-1" fill="white" />
                        </div>

                        {/* Click to watch label */}
                        <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-purple-300 text-sm uppercase tracking-wider">
                            Clique para assistir
                          </p>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-5">
                        <h3 className="font-bold text-lg text-white mb-2 group-hover:gradient-text-static transition-all">
                          {video.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2">
                          {video.description}
                        </p>
                      </div>
                    </motion.div>
                  </CardHover>
                </AnimatedSection>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#030014]/98 flex items-center justify-center p-4"
            onClick={handleCloseVideo}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={handleCloseVideo}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
              aria-label="Fechar vídeo"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Video container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video title */}
              <h3 className="text-2xl font-bold text-white mb-4 text-center">
                {selectedVideo.title}
              </h3>

              {/* Video player */}
              <div className="aspect-video rounded-xl overflow-hidden neon-glow">
                {selectedVideo.video_type === 'upload' ? (
                  <video
                    src={selectedVideo.url}
                    controls
                    autoPlay
                    className="w-full h-full bg-black"
                  />
                ) : (
                  <iframe
                    src={getVideoEmbedUrl(selectedVideo)}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Video description */}
              {selectedVideo.description && (
                <p className="text-gray-400 text-center mt-4 max-w-2xl mx-auto">
                  {selectedVideo.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
});
