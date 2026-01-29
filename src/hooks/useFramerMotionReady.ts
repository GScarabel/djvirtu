import { useState, useEffect } from 'react';

export function useFramerMotionReady() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if DOM is available and framer-motion is ready
    if (typeof window !== 'undefined') {
      // Wait for fonts and initial layout to be ready
      const checkReady = () => {
        // Check if document fonts are ready (if available)
        if ('fonts' in document) {
          (document as any).fonts.ready.then(() => {
            // Small delay to ensure all initial layouts are calculated
            setTimeout(() => setIsReady(true), 100);
          }).catch(() => {
            // If font loading fails, still allow the app to load after a short delay
            setTimeout(() => setIsReady(true), 300);
          });
        } else {
          // If font API not available, just wait a bit
          setTimeout(() => setIsReady(true), 300);
        }
      };

      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkReady);
        return () => document.removeEventListener('DOMContentLoaded', checkReady);
      } else {
        checkReady();
      }
    }
  }, []);

  return isReady;
}
