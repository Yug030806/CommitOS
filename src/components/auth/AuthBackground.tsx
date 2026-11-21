'use client';

import React from 'react';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-[#050507] overflow-hidden pointer-events-none flex items-center justify-center -z-10 select-none">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute w-[720px] h-[720px] rounded-full bg-zinc-700/25 blur-[160px] animate-ambient-1 pointer-events-none" />
      <div className="absolute w-[480px] h-[480px] rounded-full bg-zinc-500/15 blur-[110px] animate-ambient-2 pointer-events-none" />
      <div className="absolute w-[260px] h-[260px] rounded-full bg-white/[0.06] blur-[75px] animate-orbit-light pointer-events-none" />

      {/* Kinetic 3D Monochrome Sculpture with Floating Breathe Motion */}
      <div className="relative animate-sculpture-float flex items-center justify-center">
        <svg
          className="w-[760px] h-[760px] max-w-none text-zinc-900 drop-shadow-[0_30px_65px_rgba(0,0,0,0.98)] opacity-95 animate-sculpture-spin"
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main 3D lighting gradient */}
            <radialGradient id="sculptureLighting" cx="42%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#444456" />
              <stop offset="25%" stopColor="#2a2a36" />
              <stop offset="60%" stopColor="#15151d" />
              <stop offset="100%" stopColor="#08080c" />
            </radialGradient>

            {/* Rim light highlight */}
            <linearGradient id="rimHighlight" x1="20%" y1="10%" x2="80%" y2="90%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#a1a1aa" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#27272a" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
            </linearGradient>

            {/* Deep void cavity shadow */}
            <radialGradient id="cavityShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#000000" stopOpacity="1" />
              <stop offset="75%" stopColor="#050507" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#14141c" stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* Outer Rounded Geometric Frame */}
          <path
            d="M 645 285 Q 700 400 645 515 Q 560 630 400 685 Q 240 630 155 515 Q 100 400 155 285 Q 240 170 400 115 Q 560 170 645 285 Z"
            fill="url(#sculptureLighting)"
            stroke="url(#rimHighlight)"
            strokeWidth="3"
          />

          {/* Outer secondary rim layer */}
          <path
            d="M 630 295 Q 680 400 630 505 Q 550 610 400 660 Q 250 610 170 505 Q 120 400 170 295 Q 250 190 400 140 Q 550 190 630 295 Z"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.1"
            strokeWidth="1.5"
          />

          {/* 8 Primary Radial Petal / Aperture Voids */}
          {/* Void 0 (0 deg - Right) */}
          <path
            d="M 470 400 C 530 355 570 345 625 400 C 570 455 530 445 470 400 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 1 (45 deg - Bottom-Right) */}
          <path
            d="M 450 450 C 510 440 550 480 560 560 C 480 550 440 510 450 450 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 2 (90 deg - Bottom) */}
          <path
            d="M 400 470 C 445 530 445 570 400 625 C 355 570 355 530 400 470 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 3 (135 deg - Bottom-Left) */}
          <path
            d="M 350 450 C 360 510 320 550 240 560 C 250 480 290 440 350 450 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 4 (180 deg - Left) */}
          <path
            d="M 330 400 C 270 445 230 455 175 400 C 230 345 270 355 330 400 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 5 (225 deg - Top-Left) */}
          <path
            d="M 350 350 C 290 360 250 320 240 240 C 320 250 360 290 350 350 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 6 (270 deg - Top) */}
          <path
            d="M 400 330 C 355 270 355 230 400 175 C 445 230 445 270 400 330 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />
          {/* Void 7 (315 deg - Top-Right) */}
          <path
            d="M 450 350 C 440 290 480 250 560 240 C 550 320 510 360 450 350 Z"
            fill="url(#cavityShadow)"
            stroke="#000000"
            strokeWidth="3"
          />

          {/* Central Iris Core with Reverse Rotating Accents */}
          <g className="animate-sculpture-spin-reverse origin-[400px_400px]">
            <circle cx="400" cy="400" r="70" fill="#08080c" stroke="url(#rimHighlight)" strokeWidth="2" />
            <circle cx="400" cy="400" r="45" fill="#030305" />

            {/* Secondary Embosses rotating in core */}
            <circle cx="510" cy="270" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
            <circle cx="290" cy="270" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
            <circle cx="510" cy="530" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
            <circle cx="290" cy="530" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Radial soft vignette overlay fading into deep black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#050507_85%)] pointer-events-none" />
    </div>
  );
}
