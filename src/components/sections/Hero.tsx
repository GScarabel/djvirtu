import { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import { FloatingElement } from '../ui/EnhancedAnimations';
import { motionSafeTransition, fastMotionSafeTransition } from '../../utils/motion';

export const Hero = memo(function Hero() {
  const { settings, loading } = useSiteSettings();
  const scrollToAbout = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  if (loading) {
    return (
      <section
        id="home"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 animated-bg" />

      {/* Animated gradient orbs - otimizados com CSS animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/20 to-violet-600/5 rounded-full blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-blue-600/20 to-indigo-600/5 rounded-full blur-[100px] animate-pulse-slow [animation-delay:3s]" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: fastMotionSafeTransition.duration,
              ease: fastMotionSafeTransition.ease,
              delay: 0.1
            }}
            className="section-subtitle mb-6"
          >
            {settings.site_tagline}
          </motion.p>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: motionSafeTransition.duration,
              ease: motionSafeTransition.ease,
              delay: 0.2
            }}
            className="section-title text-5xl md:text-7xl lg:text-8xl mb-8"
          >
            <span className="gradient-text text-glow">
              {settings.hero_title}
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: fastMotionSafeTransition.duration,
              ease: fastMotionSafeTransition.ease,
              delay: 0.3
            }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            {settings.hero_subtitle}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: fastMotionSafeTransition.duration,
              ease: fastMotionSafeTransition.ease,
              delay: 0.4
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >

          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: motionSafeTransition.duration,
              ease: motionSafeTransition.ease,
              delay: 0.6
            }}
            className="flex flex-wrap justify-center gap-12 md:gap-16"
          >
            {[
              { value: '500+', label: 'Eventos Realizados' },
              { value: '10+', label: 'Anos de Carreira' },

            ].map((stat, index) => (
              <FloatingElement key={stat.label} delay={index * 0.1}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: fastMotionSafeTransition.duration,
                    ease: fastMotionSafeTransition.ease,
                    delay: 0.7 + index * 0.1
                  }}
                  className="text-center"
                >
                  <span className="block text-4xl md:text-5xl font-bold gradient-text-static mb-2">
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-500 uppercase tracking-wider">
                    {stat.label}
                  </span>
                </motion.div>
              </FloatingElement>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-2 text-gray-500 hover:text-purple-400 transition-colors cursor-pointer"
        >
          <span className="text-xs uppercase tracking-[0.2em]">Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-8 w-px h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent hidden lg:block" />
      <div className="absolute top-1/4 right-8 w-px h-32 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent hidden lg:block" />
    </section>
  );
});
