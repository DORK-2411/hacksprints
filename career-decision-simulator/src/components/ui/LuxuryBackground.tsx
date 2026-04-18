'use client';

import React from 'react';

export default function LuxuryBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0b0b0f] overflow-hidden flex flex-col">
      
      {/* 1. Underlying Noise Texture - SVG Filter */}
      {/* Adds physical material richness (matte / grain feel) preventing color banding */}
      <div 
        className="absolute inset-0 z-0 mix-blend-overlay pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <filter id="luxuryNoiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#luxuryNoiseFilter)" />
        </svg>
      </div>

      {/* 2. Slow Luxury Gradient Glows */}
      {/* Deep, ultra-low opacity gradients mimicking studio lighting on premium matte surfaces */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Soft Muted Gold Glow (Top Right) */}
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[100px] mix-blend-screen"
          style={{ 
            opacity: 0.06,
            background: 'radial-gradient(circle, #d4af37 0%, transparent 70%)',
            animation: 'luxuryFloat 12s ease-in-out infinite alternate' 
          }}
        />

        {/* Deep Blue Sheen (Bottom Left) */}
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] mix-blend-screen"
          style={{ 
            opacity: 0.08,
            background: 'radial-gradient(circle, #1a2a6c 0%, transparent 70%)',
            animation: 'luxuryFloat 15s ease-in-out infinite alternate-reverse' 
          }}
        />
      </div>

      {/* 3. Glass / Light Reflection Sheen */}
      {/* Simulated angled structural reflection that shifts gently to give depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-0 left-[-50%] w-[200%] h-full rotate-12 origin-top-left"
          style={{ 
            opacity: 0.015,
            background: 'linear-gradient(90deg, transparent, #ffffff, transparent)' 
          }}
        />
      </div>

      {/* 4. Vignette / Shadow Overlay for Depth */}
      {/* Darkens the edges to focus exactly on the center content */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none mix-blend-multiply"
        style={{ background: 'radial-gradient(circle at center, transparent 30%, #050508 100%)' }}
      />

      {/* Foreground Content Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center min-h-screen">
        {children}
      </div>

      {/* Internal Custom CSS Animations */}
      <style>{`
        @keyframes luxuryFloat {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
