import { useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePreloader } from '../../hooks/usePreloader';
import { fastMotionSafeTransition, infiniteMotionProps } from '../../utils/motion';
import { useAnimationReady } from '../../contexts/AnimationReadyContext';

interface LoadingScreenProps {
  onLoadComplete: () => void;
}

export const LoadingScreen = memo(function LoadingScreen({ onLoadComplete }: LoadingScreenProps) {
  const { progress, status, isComplete } = usePreloader();
  const { isAnimationReady } = useAnimationReady();

  useEffect(() => {
    // Only complete loading when both preloading and animations are ready
    if (isComplete && isAnimationReady) {
      // Pequeno delay para a animação de saída
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isAnimationReady, onLoadComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fastMotionSafeTransition.duration, ease: fastMotionSafeTransition.ease }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#030014]"
      >
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 1.5,
              repeat: infiniteMotionProps.repeat,
              ease: 'easeInOut',
            }}
            className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 1.5,
              repeat: infiniteMotionProps.repeat,
              ease: 'easeInOut',
              delay: 0.7,
            }}
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[120px]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Logo/DJ Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...fastMotionSafeTransition, ease: 'easeOut' }}
            className="mb-8"
          >
            <div className="relative">
              {/* Outer ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: infiniteMotionProps.repeat, ease: 'linear' }} // Reduced from 6 to 4 seconds
                className="w-32 h-32 rounded-full border-2 border-purple-500/30"
              />

              {/* Middle ring with gradient */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: infiniteMotionProps.repeat, ease: 'linear' }} // Reduced from 4 to 3 seconds
                className="absolute inset-2 rounded-full border-2 border-transparent"
                style={{
                  background: 'linear-gradient(#030014, #030014) padding-box, linear-gradient(135deg, #7c3aed, #3b82f6) border-box',
                }}
              />

              {/* Inner circle with pulsing effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                    '0 0 40px rgba(139, 92, 246, 0.5)',
                    '0 0 20px rgba(139, 92, 246, 0.3)',
                  ],
                }}
                transition={{ duration: 1, repeat: infiniteMotionProps.repeat }} // Reduced from 1.5 to 1 second
                className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center"
              >
                {/* Vinyl grooves */}
                <div className="absolute inset-2 rounded-full border border-white/10" />
                <div className="absolute inset-4 rounded-full border border-white/10" />
                <div className="absolute inset-6 rounded-full border border-white/10" />

                {/* Center dot */}
                <div className="w-4 h-4 rounded-full bg-white/90 shadow-lg" />
              </motion.div>
            </div>
          </motion.div>

       
          {/* Progress bar container */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '280px' }}
            transition={{ delay: 0.3, ...fastMotionSafeTransition }}
            className="relative"
          >
            {/* Progress bar background */}
            <div className="w-[280px] h-1 bg-white/10 rounded-full overflow-hidden">
              {/* Animated progress bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full relative"
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #8b5cf6, #3b82f6)',
                }}
              >
                {/* Shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }} // Reduced from 1.5 to 1 second
                  className="absolute inset-0 w-1/2"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                  }}
                />
              </motion.div>
            </div>

            {/* Progress percentage */}
            <div className="flex justify-between items-center mt-4">
              <motion.p
                key={status}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-gray-400 text-sm"
              >
                {status}
              </motion.p>
              <motion.span
                key={progress}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-purple-400 text-sm font-medium"
              >
                {progress}%
              </motion.span>
            </div>
          </motion.div>

          {/* Animated dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 mt-8"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 0.4,
                  repeat: infiniteMotionProps.repeat,
                  delay: i * 0.05,
                }}
                className="w-2 h-2 rounded-full bg-purple-500"
              />
            ))}
          </motion.div>
        </div>

        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
});
