import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useFramerMotionReady } from '../hooks/useFramerMotionReady';

interface AnimationReadyContextType {
  isAnimationReady: boolean;
  markAnimationAsReady: () => void;
}

const AnimationReadyContext = createContext<AnimationReadyContextType | undefined>(undefined);

export function AnimationReadyProvider({ children }: { children: ReactNode }) {
  const [isAnimationReady, setIsAnimationReady] = useState(false);
  const isFramerMotionReady = useFramerMotionReady();

  useEffect(() => {
    // Mark animations as ready when framer-motion is ready
    if (isFramerMotionReady) {
      // Add a small delay to ensure all animations are properly initialized
      const timer = setTimeout(() => {
        setIsAnimationReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isFramerMotionReady]);

  const markAnimationAsReady = () => {
    setIsAnimationReady(true);
  };

  return (
    <AnimationReadyContext.Provider value={{ isAnimationReady, markAnimationAsReady }}>
      <div className={isAnimationReady ? 'app-content-visible' : 'app-content-hidden'}>
        {children}
      </div>
    </AnimationReadyContext.Provider>
  );
}

export function useAnimationReady() {
  const context = useContext(AnimationReadyContext);
  if (context === undefined) {
    throw new Error('useAnimationReady must be used within an AnimationReadyProvider');
  }
  return context;
}
