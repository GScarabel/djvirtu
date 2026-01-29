// Utility functions for motion preferences
export const prefersReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

// Helper function to create transition objects with consistent types
const createTransition = (duration: number, ease?: [number, number, number, number]) => ({
  duration,
  ease
});

// Motion safe values
export const motionSafeTransition = prefersReducedMotion()
  ? createTransition(0)
  : createTransition(0.4, [0.25, 0.1, 0.25, 1]);

export const fastMotionSafeTransition = prefersReducedMotion()
  ? createTransition(0)
  : createTransition(0.2, [0.25, 0.1, 0.25, 1]);

export const slowMotionSafeTransition = prefersReducedMotion()
  ? createTransition(0)
  : createTransition(0.6, [0.25, 0.1, 0.25, 1]);

export const infiniteMotionProps = prefersReducedMotion()
  ? { repeat: 0 }
  : { repeat: Infinity };
