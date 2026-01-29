import { useEffect, useRef, memo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  color: string;
}

export const ParticleBackground = memo(function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let isVisible = true;

    // Cores pré-calculadas
    const primaryColor = isDark ? '139, 92, 246' : '124, 58, 237';
    const secondaryColor = isDark ? '59, 130, 246' : '37, 99, 235';

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    const createParticles = () => {
      particles = [];
      // Reduzir número de partículas para melhor performance
      const particleCount = Math.min(
        Math.floor((window.innerWidth * window.innerHeight) / 25000),
        60
      );

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.5 + 0.2,
          color: i % 3 === 0 ? secondaryColor : primaryColor,
        });
      }
    };

    const drawParticles = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(drawParticles);
        return;
      }

      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(0, 0, width, height);

      // Desenhar partículas
      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;

        // Desenhar partícula com cor sólida (mais rápido que gradiente)
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${particle.color}, ${particle.opacity})`;
        ctx.fill();
      }

      // Desenhar linhas apenas entre partículas próximas (otimizado)
      ctx.strokeStyle = `rgba(${primaryColor}, 0.08)`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 8100) { // 90^2 - evita Math.sqrt
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
          }
        }
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    // Pausar animação quando a aba não está visível
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    const handleResize = () => {
      resizeCanvas();
      createParticles();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);

    resizeCanvas();
    createParticles();
    drawParticles();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
    };
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6, willChange: 'auto' }}
    />
  );
});
