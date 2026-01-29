import { useState, useEffect, useRef, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

interface GlowCursorProps {
  children?: React.ReactNode;
}

export function GlowCursor({ children }: GlowCursorProps) {
  const [points, setPoints] = useState<Point[]>([]);

  const lastTime = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now();

    // Adiciona um ponto à trilha a cada 32ms (~30fps) para melhor desempenho em dispositivos móveis
    if (now - lastTime.current > 32) {
      lastTime.current = now;

      const newPoint: Point = {
        x: e.clientX,
        y: e.clientY,
        timestamp: now,
      };

      setPoints(prev => [newPoint, ...prev].slice(0, 20)); // Reduzido para 20 pontos para melhor desempenho
    }
  }, []);

  const handleMouseEnter = useCallback(() => {}, []);

  const handleMouseLeave = useCallback(() => {}, []);

  const handleMouseDown = useCallback(() => {}, []);

  const handleMouseUp = useCallback(() => {}, []);

  useEffect(() => {
    // Adiciona listeners globais
    document.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseenter', handleMouseEnter);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Loop de animação para atualizar a trilha
    const updateTrail = () => {
      const now = Date.now();
      setPoints(prev =>
        prev
          .filter(point => (now - point.timestamp) < 300) // Remove pontos com mais de 1 segundo
      );
      animationFrameRef.current = requestAnimationFrame(updateTrail);
    };

    animationFrameRef.current = requestAnimationFrame(updateTrail);

    // Limpa os listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [handleMouseMove, handleMouseEnter, handleMouseLeave, handleMouseDown, handleMouseUp]);

  return (
    <div ref={containerRef}>
      {/* Linha de trilha usando SVG */}
      {points.length > 1 && (
        <svg
          className="fixed top-0 left-0 pointer-events-none"
          style={{ zIndex: 9998, mixBlendMode: 'screen' }}
          width={window.innerWidth}
          height={window.innerHeight}
        >
          <path
            d={`M ${points.map((p, i) =>
              `${p.x},${p.y}${i === points.length - 1 ? '' : ' L'}`
            ).join(' ')}`}
            fill="none"
            stroke="url(#trailGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <defs>
            <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {children}
    </div>
  );
}