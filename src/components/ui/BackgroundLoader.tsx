import { useEffect } from 'react';
import { usePreloader } from '../../hooks/usePreloader';
import { useFramerMotionReady } from '../../hooks/useFramerMotionReady';

interface BackgroundLoaderProps {
  onLoadComplete: () => void;
}

/**
 * Invisible component that handles the loading logic in the background.
 * This separates the logic from the LoadingScreen visuals to prevent
 * React re-renders from interfering with the GPU-accelerated CSS animations.
 */
export function BackgroundLoader({ onLoadComplete }: BackgroundLoaderProps) {
  const { isComplete } = usePreloader();
  const isFramerMotionReady = useFramerMotionReady();

  useEffect(() => {
    // Only complete loading when both preloading and fonts/motion are ready
    if (isComplete && isFramerMotionReady) {
      // Pequeno delay para a animação de saída de quem estiver ouvindo
      const timer = setTimeout(() => {
        onLoadComplete();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isComplete, isFramerMotionReady, onLoadComplete]);

  return null; // This component is invisible
}
