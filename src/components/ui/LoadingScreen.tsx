import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fastMotionSafeTransition, infiniteMotionProps } from '../../utils/motion';

/**
 * Purely visual loading screen. Dedicated to a smooth, interrupt-free ECG animation.
 * By removing all state and hooks, we ensure React never re-renders this component,
 * allowing the browser's compositor thread to keep the CSS animation fluid.
 */
export const LoadingScreen = memo(function LoadingScreen() {
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
        {/* Vital Signs / Heartbeat Animation */}
        <div className="relative z-10 flex flex-col items-center mb-12">
          <div className="relative w-64 h-32 flex items-center justify-center">
            {/* ECG Path Background */}
            <svg
              viewBox="0 0 200 100"
              className="w-full h-full opacity-10"
            >
              <path
                d="M0,50 L40,50 L50,20 L60,80 L70,50 L100,50 L110,10 L125,90 L140,50 L200,50"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-purple-500"
              />
            </svg>

            {/* Animated ECG Path (Global CSS Seamless Loop) */}
            <svg
              viewBox="0 0 200 100"
              className="absolute inset-0 w-full h-full drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]"
            >
              <path
                d="M0,50 L40,50 L50,20 L60,80 L70,50 L100,50 L110,10 L125,90 L140,50 L200,50"
                fill="none"
                stroke="url(#ecg-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="100"
                className="ecg-path-animated"
              />
              <defs>
                <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                  <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Heartbeat Pulse Dot (Global CSS) */}
            <div
              className="absolute w-4 h-4 rounded-full bg-purple-500/80 blur-[2px] heartbeat-dot shadow-[0_0_15px_rgba(168,85,247,0.5)]"
              style={{ top: 'calc(50% - 8px)', right: '10%' }}
            />
          </div>
        </div>

       
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
