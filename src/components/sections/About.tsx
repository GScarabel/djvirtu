import { memo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Disc3, Award, Play as PlayIcon, Pause as PauseIcon } from 'lucide-react';
import { AnimatedSection } from '../ui/AnimatedSection';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { CardHover } from '../ui/EnhancedAnimations';

export const About = memo(function About() {
  const { settings, loading } = useSiteSettings();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleMusic = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        // Pause the music
        audioRef.current.pause();
        setIsPlaying(false);
        console.log('Music paused');
      } else {
        // Set the source to your music file (the file should be in the public folder)
        audioRef.current.src = '/sample-music.mp3'; // Make sure this matches your file name

        try {
          // Load the audio file
          audioRef.current.load(); // This ensures the new source is loaded

          // Play the music - wrap in a user gesture context
          const playPromise = audioRef.current.play();

          if (playPromise !== undefined) {
            await playPromise;
            setIsPlaying(true);
            console.log('Music started playing');
          }
        } catch (error: any) {
          console.error('Error playing music:', error);
          alert('Não foi possível reproduzir a música. Verifique se o arquivo sample-music.mp3 existe na pasta public.\n\nDetalhes: ' + error.message);
        }
      }
    }
  };

  if (loading) {
    return (
      <section id="about" className="section-padding relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="section-padding relative overflow-hidden">
      {/* Section divider */}
      <div className="absolute top-0 left-0 right-0 section-divider" />

      {/* Background accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 -left-64 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image/Visual Section */}
          <AnimatedSection direction="left">
            <div className="relative">
              {/* Main image placeholder with gradient border */}
              <div className="gradient-border p-1 rounded-2xl">
                <div className="aspect-[4/5] rounded-xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-blue-900/40 relative">
                  {/* Play/Pause Button positioned in top-left corner */}
                  <div className="absolute top-4 left-4 z-20">
                    <button
                      onClick={toggleMusic}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 shadow-lg"
                      aria-label={isPlaying ? "Pausar música" : "Tocar música"}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5 text-white" />
                      ) : (
                        <PlayIcon className="w-5 h-5 text-white ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Placeholder content - replace with actual image */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{
                          duration: isPlaying ? 30 : 0.5,
                          repeat: isPlaying ? Infinity : 0,
                          ease: 'linear'
                        }}
                        className="w-64 h-64 rounded-full bg-gradient-to-br from-purple-700/30 to-blue-700/30 flex items-center justify-center"
                      >
                        <motion.div
                          animate={{ rotate: isPlaying ? -360 : 0 }}
                          transition={{
                            duration: isPlaying ? 20 : 0.5,
                            repeat: isPlaying ? Infinity : 0,
                            ease: 'linear'
                          }}
                          className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-700/30 to-purple-700/30 flex items-center justify-center"
                        >
                          <motion.div
                            animate={{ rotate: isPlaying ? 360 : 0 }}
                            transition={{
                              duration: isPlaying ? 15 : 0.5,
                              repeat: isPlaying ? Infinity : 0,
                              ease: 'linear'
                            }}
                            className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-800/40 to-blue-800/40 flex items-center justify-center"
                          >
                            <Disc3 className="w-16 h-16 text-purple-400" />
                          </motion.div>
                        </motion.div>
                      </motion.div>

                    </div>
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030014] via-transparent to-transparent" />
                </div>

                {/* Audio element for playing music - moved outside the main div to avoid z-index issues */}
                <audio ref={audioRef} className="hidden" />
              </div>

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-8 -right-4 lg:-right-8 glass-card p-5 rounded-xl neon-glow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Award className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold gradient-text-static">10+</p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Anos de Carreira</p>
                  </div>
                </div>
              </motion.div>

              {/* Decorative line */}
              <div className="absolute -left-4 top-1/4 w-px h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent hidden lg:block" />
            </div>
          </AnimatedSection>

          {/* Content Section */}
          <AnimatedSection direction="right">
            <div className="space-y-8">
              {/* Section label */}
              <p className="section-subtitle">Sobre</p>

              {/* Title */}
              <h2 className="section-title text-3xl md:text-4xl lg:text-5xl text-center">
                <span className="gradient-text block">Transformando</span>
                <span className="text-white block">Experiências</span>
              </h2>

              {/* Decorative line */}
              <div className="decorative-line" />

              {/* Description */}
              <div className="space-y-6 text-gray-400 leading-relaxed">
                <p className="text-lg">
                  {settings.about_text}
                </p>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { value: '500+', label: 'Eventos' },
                  { value: '100%', label: 'Sucesso' },
                  { value: '10+', label: 'Experiência' },
                  { value: 'Premium', label: 'Qualidade Garantida' },
                ].map((item, index) => (
                  <CardHover key={item.label} className="p-3 rounded-lg">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="card-hover p-3 rounded-lg"
                    >
                      <p className="text-xl font-bold gradient-text-static break-words">{item.value}</p>
                      <p className="text-xs text-gray-500 uppercase tracking-wide break-words">{item.label}</p>
                    </motion.div>
                  </CardHover>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>

      {/* Section divider */}
      <div className="absolute bottom-0 left-0 right-0 section-divider" />
    </section>
  );
});
