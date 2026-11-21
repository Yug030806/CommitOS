'use client';

import React from 'react';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-[#060608] overflow-hidden pointer-events-none flex items-center justify-center z-0 select-none">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute w-[800px] h-[800px] rounded-full bg-zinc-600/25 blur-[160px] animate-ambient-1 pointer-events-none" />
      <div className="absolute w-[550px] h-[550px] rounded-full bg-white/[0.08] blur-[120px] animate-ambient-2 pointer-events-none" />

      {/* Large Glowing CommitOS Emblem Centerpiece */}
      <div className="relative flex items-center justify-center animate-sculpture-float">
        {/* Soft radial aura directly behind emblem */}
        <div className="absolute w-[550px] h-[550px] rounded-full bg-white/[0.08] blur-[80px] pointer-events-none" />

        {/* The Exact CommitOS Emblem (C + Checkmark + Orbit) */}
        <img
          src="/login-bg-emblem.png"
          alt="CommitOS Emblem Background"
          className="w-[450px] sm:w-[620px] md:w-[720px] max-w-[90vw] h-auto object-contain opacity-90 drop-shadow-[0_0_80px_rgba(255,255,255,0.4)] select-none pointer-events-none"
        />
      </div>

      {/* Radial soft vignette overlay fading edges smoothly into dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#060608_90%)] pointer-events-none" />
    </div>
  );
}
