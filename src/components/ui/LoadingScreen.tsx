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
        {/* Vital Signs / Heartbeat Animation (GPU-Only Meteor Effect) */}
        <div className="relative z-10 flex flex-col items-center mb-12">
          <div className="relative w-64 h-32 flex items-center justify-center">
            {/* Animated ECG Path (GPU Sweeper Reveal) */}
            <div className="absolute inset-0 w-full h-full ecg-reveal-container overflow-hidden">
              <div 
                className="absolute inset-0 w-[60%] h-full ecg-inner-path overflow-visible relative"
                style={{ 
                  // Meteor tail effect: Sharp leading edge, long fading trail
                  maskImage: 'linear-gradient(to right, transparent 0%, black 70%, black 90%, transparent 100%)',
                  maskSize: '100% 100%'
                }}
              >
                {/* Heartbeat Pulse - The "Meteor" Head */}
                <div
                  className="absolute w-3.5 h-3.5 rounded-full bg-white heartbeat-dot z-20 shadow-[0_0_25px_4px_rgba(168,85,247,1),0_0_40px_rgba(59,130,246,0.6)]"
                  style={{ 
                    top: 'calc(50% - 7px)', 
                    right: '5%', // Leading edge
                    filter: 'blur(0.2px)'
                  }}
                >
                  {/* Meteor Wind / Motion Trails (Flowing to the left) */}
                  <div className="absolute top-1/2 -left-8 w-8 h-[1px] bg-gradient-to-r from-transparent to-white/60 blur-[1px] -translate-y-1/2" />
                  <div className="absolute top-[20%] -left-6 w-6 h-[1px] bg-gradient-to-r from-transparent to-purple-400/40 blur-[1px] -rotate-[10deg]" />
                  <div className="absolute bottom-[20%] -left-6 w-6 h-[1px] bg-gradient-to-r from-transparent to-blue-400/40 blur-[1px] rotate-[10deg]" />
                </div>

                <div className="absolute inset-0 w-[166.66%] h-full ecg-inner-path">
                  <svg
                    viewBox="0 0 200 100"
                    className="w-full h-full drop-shadow-[0_0_10px_rgba(168,85,247,0.7)]"
                  >
                    <path
                      d="M0,50 L40,50 L50,20 L60,80 L70,50 L100,50 L110,10 L125,90 L140,50 L200,50"
                      fill="none"
                      stroke="url(#ecg-gradient)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                        <stop offset="80%" stopColor="#a855f7" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
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
