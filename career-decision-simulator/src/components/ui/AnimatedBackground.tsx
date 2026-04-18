'use client';

import React, { useEffect, useRef } from 'react';

export default function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; radius: number; alpha: number }[] = [];
    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      // Adjust density based on screen size (keeps it performant)
      const numParticles = Math.floor((canvas.width * canvas.height) / 15000); 
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.4, // ultra-slow drift
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 1.5 + 0.5,
          alpha: Math.random() * 0.5 + 0.1,
        });
      }
    };

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle tech grid
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion translation
        p.x += p.vx;
        p.y += p.vy;

        // Boundary bounce map
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Render point
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${p.alpha})`;
        ctx.fill();

        // Connect nearby points to simulate a neural network
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            // Opacity fades gracefully with distance
            ctx.strokeStyle = `rgba(0, 212, 255, ${(120 - distance) / 1000})`; 
            ctx.lineWidth = 0.5;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Initialization
    window.addEventListener('resize', resize);
    resize();
    draw();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0a0a0a] overflow-hidden">
      
      {/* Floating Animated Gradient Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00d4ff] opacity-10 blur-[120px] mix-blend-screen"
          style={{ animation: 'bgPulse 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-violet-600 opacity-10 blur-[150px] mix-blend-screen" 
          style={{ animation: 'bgPulse 8s ease-in-out infinite 4s' }} 
        />
      </div>
      
      {/* Responsive interactive canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Yield wrapped content onto a higher z-index */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen">
        {children}
      </div>

      {/* Internal localized CSS to guarantee self-containment */}
      <style>{`
        @keyframes bgPulse {
          0%, 100% { transform: scale(1) translate(0px, 0px); opacity: 0.05; }
          50% { transform: scale(1.1) translate(20px, 20px); opacity: 0.15; }
        }
      `}</style>
    </div>
  );
}
