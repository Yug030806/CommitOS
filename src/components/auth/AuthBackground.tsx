'use client';

import React from 'react';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-[#060608] overflow-hidden pointer-events-none flex items-center justify-center -z-10 select-none">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute w-[680px] h-[680px] rounded-full bg-zinc-700/20 blur-[150px] animate-ambient-1 pointer-events-none" />
      <div className="absolute w-[440px] h-[440px] rounded-full bg-zinc-400/10 blur-[110px] animate-ambient-2 pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-white/[0.05] blur-[80px] animate-orbit-light pointer-events-none" />

      {/* Background Animated CommitOS Logo & Emblem */}
      <div className="relative flex flex-col items-center justify-center animate-sculpture-float">
        {/* Soft radial glow behind the emblem */}
        <div className="absolute w-[460px] h-[460px] rounded-full bg-white/[0.04] blur-[90px] pointer-events-none" />

        {/* Large CommitOS Logo Emblem in the background */}
        <div className="relative flex items-center justify-center">
          <img
            src="/logo-icon-white.png"
            alt="CommitOS Background Emblem"
            className="w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] object-contain opacity-35 drop-shadow-[0_0_60px_rgba(255,255,255,0.18)]"
          />

          {/* Subtle slow rotating orbital ring around logo */}
          <div className="absolute w-[440px] sm:w-[580px] h-[440px] sm:h-[580px] rounded-full border border-white/[0.08] animate-sculpture-spin pointer-events-none" />
          <div className="absolute w-[500px] sm:w-[660px] h-[500px] sm:h-[660px] rounded-full border border-dashed border-white/[0.04] animate-sculpture-spin-reverse pointer-events-none" />
        </div>

        {/* Subtle CommitOS full wordmark faintly visible below */}
        <img
          src="/logo-white.png"
          alt="CommitOS Logo"
          className="w-64 sm:w-80 object-contain opacity-20 mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
        />
      </div>

      {/* Radial soft vignette overlay fading edges smoothly into dark */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_35%,_#060608_88%)] pointer-events-none" />
    </div>
  );
}
