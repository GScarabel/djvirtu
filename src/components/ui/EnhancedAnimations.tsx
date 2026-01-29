import { motion } from "framer-motion";
import React from "react";
import { fastMotionSafeTransition, motionSafeTransition, infiniteMotionProps } from "../../utils/motion";

// Enhanced glow effect component
export const GlowEffect = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-xl -z-10 animate-pulse" />
    </div>
  );
};

// Enhanced card hover effect
export const CardHover = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.div
      whileHover={{
        y: -5,
        boxShadow: "0 15px 30px -12px rgba(139, 92, 246, 0.25)",
        transition: {
          duration: fastMotionSafeTransition.duration,
          ease: fastMotionSafeTransition.ease
        }
      }}
      className={`transition-all duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Enhanced button with ripple effect
export const ButtonRipple = ({ children, className = "", onClick, ...props }: {
  children: React.ReactNode;
  className?: string;
  onClick?: (e?: React.MouseEvent<HTMLElement>) => void;
  [key: string]: any;
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 opacity-0 hover:opacity-100 transition-opacity"
        whileHover={{ scale: 2, opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

// Enhanced text animation
export const AnimatedText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: motionSafeTransition.duration,
        ease: motionSafeTransition.ease
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

// Enhanced floating element
export const FloatingElement = ({ children, className = "", delay = 0 }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      animate={{
        y: [0, -5, 0],
      }}
      transition={{
        duration: 3,
        repeat: infiniteMotionProps.repeat,
        ease: "easeInOut",
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
