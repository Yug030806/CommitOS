'use client';

import React from 'react';

export default function AuthBackground() {
  return (
    <div className="fixed inset-0 bg-[#050507] overflow-hidden pointer-events-none flex items-center justify-center -z-10 select-none">
      {/* Ambient background glows */}
      <div className="absolute w-[650px] h-[650px] rounded-full bg-zinc-800/20 blur-[140px] pointer-events-none" />
      <div className="absolute w-[350px] h-[350px] rounded-full bg-zinc-600/10 blur-[80px] pointer-events-none" />

      {/* 3D Monochrome Sculpture (Iris / Hexagonal Organic Torus) */}
      <svg
        className="w-[740px] h-[740px] max-w-none text-zinc-900 drop-shadow-[0_25px_50px_rgba(0,0,0,0.95)] opacity-95 transition-transform duration-1000 animate-in fade-in zoom-in-95"
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main 3D lighting gradient */}
          <radialGradient id="sculptureLighting" cx="42%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#3f3f4e" />
            <stop offset="25%" stopColor="#272732" />
            <stop offset="60%" stopColor="#14141a" />
            <stop offset="100%" stopColor="#09090d" />
          </radialGradient>

          {/* Rim light highlight */}
          <linearGradient id="rimHighlight" x1="20%" y1="10%" x2="80%" y2="90%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#a1a1aa" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#27272a" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.8" />
          </linearGradient>

          {/* Deep void cavity shadow */}
          <radialGradient id="cavityShadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="1" />
            <stop offset="75%" stopColor="#050507" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#14141c" stopOpacity="0.4" />
          </radialGradient>

          {/* Bevel bevel shadow */}
          <filter id="innerDepth" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="blur" />
            <feOffset dx="-4" dy="-4" result="offset" />
            <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="shadowDiff" />
            <feFlood floodColor="#ffffff" floodOpacity="0.15" />
            <feComposite in2="shadowDiff" operator="in" />
            <feComposite in2="SourceGraphic" operator="over" />
          </filter>
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
          strokeOpacity="0.08"
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

        {/* Central Iris Core */}
        <circle cx="400" cy="400" r="70" fill="#08080c" stroke="url(#rimHighlight)" strokeWidth="2" />
        <circle cx="400" cy="400" r="45" fill="#030305" />

        {/* Secondary Oval Embosses for Depth */}
        <circle cx="510" cy="270" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
        <circle cx="290" cy="270" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
        <circle cx="510" cy="530" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
        <circle cx="290" cy="530" r="18" fill="#060609" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
      </svg>

      {/* Radial soft vignette overlay fading to black */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#050507_85%)] pointer-events-none" />
    </div>
  );
}
