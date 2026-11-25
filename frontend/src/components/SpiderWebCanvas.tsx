import React, { useEffect, useRef } from 'react';

interface SpiderWebCanvasProps {
  interactive?: boolean;
  density?: number;
  opacity?: number;
}

export const SpiderWebCanvas: React.FC<SpiderWebCanvasProps> = ({
  interactive = true,
  density = 45,
  opacity = 0.28
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 140
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }

    // Particle nodes
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      glowColor: string;
    }

    const colors = [
      { fill: '#F52245', glow: 'rgba(245, 34, 69, 0.6)' }, // Spider Red
      { fill: '#087CFF', glow: 'rgba(8, 124, 255, 0.6)' }, // Electric Blue
      { fill: '#8B35FF', glow: 'rgba(139, 53, 255, 0.5)' }, // Neon Purple
      { fill: '#00F0FF', glow: 'rgba(0, 240, 255, 0.5)' }  // Cyber Cyan
    ];

    const nodes: Node[] = [];
    for (let i = 0; i < density; i++) {
      const palette = colors[Math.floor(Math.random() * colors.length)];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.75,
        vy: (Math.random() - 0.5) * 0.75,
        radius: Math.random() * 2 + 1,
        color: palette.fill,
        glowColor: palette.glow
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connecting web strands
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 135;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * opacity;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);

            // Alternate web strand gradient
            const grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0, `rgba(245, 34, 69, ${alpha})`);
            grad.addColorStop(1, `rgba(8, 124, 255, ${alpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Connect with cursor if near
      if (interactive && mouse.x > 0 && mouse.y > 0) {
        for (let i = 0; i < nodes.length; i++) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const alpha = (1 - dist / mouse.radius) * 0.7;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // Gentle repulsion/attraction to cursor
            nodes[i].x -= dx * 0.015;
            nodes[i].y -= dy * 0.015;
          }
        }
      }

      // Update and draw node anchors
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Bounce from boundaries
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = node.glowColor;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [interactive, density, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.85 }}
    />
  );
};

