import React, { useEffect, useRef } from 'react';

interface DigitalRainCanvasProps {
  opacity?: number;
}

export const DigitalRainCanvas: React.FC<DigitalRainCanvasProps> = ({ opacity = 0.35 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Characters: spider-verse symbols, python symbols, hex, katakana
    const chars = 'SPIDER0123456789DEF<>/{}[]+=*~#$!?λπΩ';
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    const render = () => {
      // Semi-transparent fade
      ctx.fillStyle = 'rgba(8, 11, 24, 0.12)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Colors: alternate between Spider Red, Cyber Cyan, and Electric Blue
        if (i % 3 === 0) {
          ctx.fillStyle = '#F52245'; // Spider Red
          ctx.shadowColor = 'rgba(245, 34, 69, 0.8)';
        } else if (i % 3 === 1) {
          ctx.fillStyle = '#00F0FF'; // Neon Cyan
          ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        } else {
          ctx.fillStyle = '#8B35FF'; // Neon Purple
          ctx.shadowColor = 'rgba(139, 53, 255, 0.7)';
        }

        ctx.shadowBlur = 6;
        ctx.fillText(text, x, y);
        ctx.shadowBlur = 0;

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity }}
    />
  );
};

