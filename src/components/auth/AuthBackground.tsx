'use client';

import React from 'react';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-[#060608] overflow-hidden pointer-events-none flex items-center justify-center -z-10 select-none">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute w-[750px] h-[750px] rounded-full bg-zinc-700/25 blur-[160px] animate-ambient-1 pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-white/[0.08] blur-[120px] animate-ambient-2 pointer-events-none" />

      {/* Large Glowing CommitOS Emblem Centerpiece */}
      <div className="relative flex items-center justify-center animate-sculpture-float">
        {/* Soft radial aura directly behind emblem */}
        <div className="absolute w-[520px] h-[520px] rounded-full bg-white/[0.06] blur-[90px] pointer-events-none" />

        {/* The Exact CommitOS Emblem (C + Checkmark + Orbit) */}
        <img
          src="/login-bg-emblem.png"
          alt="CommitOS Emblem Background"
          className="w-[480px] sm:w-[640px] md:w-[720px] h-auto object-contain opacity-85 drop-shadow-[0_0_90px_rgba(255,255,255,0.35)] select-none pointer-events-none"
        />
      </div>

      {/* Radial soft vignette overlay fading edges smoothly into dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_#060608_90%)] pointer-events-none" />
    </div>
  );
}
