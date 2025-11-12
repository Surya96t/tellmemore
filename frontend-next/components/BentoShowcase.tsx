'use client';

import React, { useState, useEffect } from 'react';
import { ShootingStars } from './ui/shooting-stars';
import ElectricBorder from './ElectricBorder';
import { Highlight } from './ui/hero-highlight';
import Hyperspeed from './Hyperspeed';

interface BentoCard {
  label: string;
  title: string;
  description: string;
  animateTitle?: boolean;
  animateDescription?: boolean;
  hasZoomEffect?: boolean;
}

/**
 * Card data array - Index determines which card, NOT the render order
 * Grid uses explicit positioning (col-start/row-start) to place each card
 * 
 * Layout on Desktop (lg: breakpoint):
 * Index 0: INSIGHTS     - Top Left    (cols 1-2, rows 1-2) ■■
 * Index 1: SPEED        - Middle Left (cols 1-2, row 3)    ■■
 * Index 2: PRODUCTIVITY - Right Side  (cols 3-4, rows 1-3) ■■■
 * Index 3: SECURITY     - Bottom Left (cols 1-2, rows 4-5) ■■
 * Index 4: COMING SOON  - Bottom Right(cols 3-4, rows 4-5) ■■
 */
const cardData: BentoCard[] = [
  // Index 0: Top Left
  {
    label: 'Insights',
    title: 'Better Decision Making',
    description: 'Make informed choices with multiple AI perspectives',
    hasZoomEffect: true,
  },
  // Index 1: Middle Left (Below Insights)
  {
    label: 'Speed',
    title: 'Real-time Responses',
    description: 'Lightning-fast answers in under 2 seconds',
    animateTitle: true, // Slide from left
  },
  // Index 2: Right Side (Tall)
  {
    label: 'Productivity',
    title: 'Time Efficiency',
    description: 'One interface for all AI perspectives',
    animateTitle: true, // Will use typewriter
  },
  // Index 3: Bottom Left
  {
    label: 'Security',
    title: 'Secure & Private',
    description: 'Bank-level 256-bit encryption',
    animateTitle: true, // Fade with scale
  },
  // Index 4: Bottom Right
  {
    label: 'Coming Soon',
    title: 'More Features',
    description: 'Advanced AI capabilities and quality assurance tools',
    animateTitle: true, // Split reveal
  },
];

export default function BentoShowcase() {
  const [insightsZoomed, setInsightsZoomed] = useState(false);

  useEffect(() => {
    // Trigger zoom effect after component mounts
    const timer = setTimeout(() => {
      setInsightsZoomed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl w-full">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
            Powerful Features & Benefits
          </h2>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            Everything you need for smarter AI conversations
          </p>
        </div>

        {/* Bento Grid Layout:
            Mobile (< 640px): 1 column - all cards stack vertically
            Tablet (640px - 1024px): 2 columns - cards flow in pairs
            Desktop (> 1024px): 4 columns with custom spans:
            
            ┌──────────────┬──────────────┐
            │   INSIGHTS   │              │  Row 1
            │  (2col×2row) │              │
            ├──────────────┤ PRODUCTIVITY │  Row 2
            │    SPEED     │  (2col×3row) │
            │  (2col×1row) │              │
            ├──────────────┤              │  Row 3
            │   SECURITY   ├──────────────┤
            │  (2col×2row) │ COMING SOON  │  Row 4
            │              │  (2col×2row) │
            └──────────────┴──────────────┘  Row 5
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto auto-rows-[minmax(140px,auto)]">
          {cardData.map((card, index) => {
            // Base card styling - shared by all cards
            const cardContent = (
              <div
                className={`
                  relative group
                  flex flex-col justify-between
                  p-8 rounded-2xl
                  border border-white/20 dark:border-white/10
                  bg-white/50 dark:bg-black/50
                  backdrop-blur-xl
                  transition-all duration-500 ease-out
                  hover:-translate-y-1
                  hover:shadow-lg hover:shadow-purple-500/20
                  overflow-hidden
                `}
                style={{
                  minHeight: index === 2 ? '500px' : index === 1 ? '200px' : '280px',
                }}
              >
                {/* Shooting Stars Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
                  <ShootingStars
                    minSpeed={5}
                    maxSpeed={15}
                    minDelay={2000}
                    maxDelay={5000}
                    starColor="#9E00FF"
                    trailColor="#2EB9DF"
                  />
                </div>

                {/* Time-lapse Animation for Productivity Card */}
                {index === 2 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    {/* Animated Progress Bars */}
                    <div className="absolute top-1/4 left-8 right-8 space-y-4">
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-fast" style={{ width: '0%' }} />
                      </div>
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-medium" style={{ width: '0%', animationDelay: '0.5s' }} />
                      </div>
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-slow" style={{ width: '0%', animationDelay: '1s' }} />
                      </div>
                    </div>
                    
                    {/* Animated Checkmarks */}
                    <div className="absolute top-1/2 left-8 space-y-3">
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '2s' }}>
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="h-1.5 w-32 bg-white/10 dark:bg-white/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '2.5s' }}>
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="h-1.5 w-24 bg-white/10 dark:bg-white/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '3s' }}>
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="h-1.5 w-28 bg-white/10 dark:bg-white/5 rounded" />
                      </div>
                    </div>
                    
                    {/* Floating particles showing workflow */}
                    <div className="absolute bottom-1/4 right-8 space-y-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full animate-float-up" style={{ animationDelay: '0s' }} />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-float-up" style={{ animationDelay: '0.3s' }} />
                      <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-float-up" style={{ animationDelay: '0.6s' }} />
                    </div>
                  </div>
                )}

                {/* Lock Icon for Security Card - Right Side */}
                {index === 3 && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ElectricBorder
                      color="#ef4444"
                      speed={1}
                      chaos={0.5}
                      thickness={2}
                      style={{ borderRadius: 9999 }}
                    >
                      <div className="relative p-8 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-full">
                        {/* Glowing ring behind lock */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-full border-2 border-red-500/30 animate-security-pulse" />
                        </div>
                        
                        {/* Lock icon */}
                        <svg
                          className="w-24 h-24 text-red-500/60 animate-security-float relative z-10"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C9.243 2 7 4.243 7 7v3H6c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-8c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zM9 7c0-1.654 1.346-3 3-3s3 1.346 3 3v3H9V7zm4 10.723V20h-2v-2.277c-.595-.347-1-.985-1-1.723 0-1.103.897-2 2-2s2 .897 2 2c0 .738-.405 1.376-1 1.723z" />
                        </svg>
                        
                        {/* Small particles around lock */}
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-red-500 rounded-full animate-security-particle"
                            style={{
                              top: `${20 + i * 30}%`,
                              right: `${-10 - i * 5}px`,
                              animationDelay: `${i * 0.4}s`,
                            }}
                          />
                        ))}
                      </div>
                    </ElectricBorder>
                  </div>
                )}

                {/* Hyperspeed Background for Speed Card */}
                {index === 1 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Hyperspeed
                      effectOptions={{
                            onSpeedUp: () => {},
                            onSlowDown: () => {},
                            distortion: 'turbulentDistortion',
                            length: 400,
                            roadWidth: 9,
                            islandWidth: 2,
                            lanesPerRoad: 3,
                            fov: 90,
                            fovSpeedUp: 150,
                            speedUp: 2,
                            carLightsFade: 0.4,
                            totalSideLightSticks: 50,
                            lightPairsPerRoadWay: 50,
                            shoulderLinesWidthPercentage: 0.05,
                            brokenLinesWidthPercentage: 0.1,
                            brokenLinesLengthPercentage: 0.5,
                            lightStickWidth: [0.12, 0.5],
                            lightStickHeight: [1.3, 1.7],
                            movingAwaySpeed: [60, 80],
                            movingCloserSpeed: [-120, -160],
                            carLightsLength: [400 * 0.05, 400 * 0.15],
                            carLightsRadius: [0.05, 0.14],
                            carWidthPercentage: [0.3, 0.5],
                            carShiftX: [-0.2, 0.2],
                            carFloorSeparation: [0.05, 1],
                            colors: {
                            roadColor: 0x080808,
                            islandColor: 0x0a0a0a,
                            background: 0x000000,
                            shoulderLines: 0x131318,
                            brokenLines: 0x131318,
                            leftCars: [0xdc5b20, 0xdca320, 0xdc2020],
                            rightCars: [0x334bf7, 0xe5e6ed, 0xbfc6f3],
                            sticks: 0xc5e8eb
                            }
                        }}
                    />
                  </div>
                )}

                {/* Card Content */}
                <div className="relative z-10">
                {/* Special Zoom Effect for Insights Card */}
                {card.hasZoomEffect ? (
                  <div className="relative h-full flex flex-col justify-center">
                    {/* Insights Label - Subtle zoom in */}
                    <div 
                      className={`
                        mb-4 transition-all duration-700 ease-out
                        ${insightsZoomed ? 'zoom-complete' : 'zoom-start'}
                      `}
                    >
                      <span className="inline-block px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30 rounded-full relative overflow-hidden group/label cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-2 animate-pulse-subtle">
                        {/* Shimmer effect overlay */}
                        <span className="absolute inset-0 -translate-x-full group-hover/label:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        <span className="relative z-10">{card.label}</span>
                      </span>
                    </div>

                    {/* Title - Appears after zoom */}
                    <div className={`transition-all duration-600 ${insightsZoomed ? 'title-reveal' : 'title-hidden'} transition-transform duration-500 hover:scale-[1.3] cursor-pointer`}>
                      <div className="flex flex-col items-center mb-3">
                        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
                          <Highlight className="text-black dark:text-white">
                            Better Decision
                          </Highlight>
                        </h3>
                        <h3 className="text-2xl mt-2 font-bold text-zinc-900 dark:text-white">
                          <Highlight className="text-black dark:text-white">
                            Making
                          </Highlight>
                        </h3>
                      </div>
                      <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed text-center">
                        {card.description}
                      </p>
                    </div>
                  </div>
                ) : index === 2 ? (
                  /* Time-lapse animation for Productivity card */
                  <div className="relative h-full flex flex-col justify-between">
                    {/* Label */}
                    <div className="mb-4">
                      <span className="inline-block px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30 rounded-full">
                        {card.label}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-3 text-zinc-900 dark:text-white animate-typewriter">
                      {card.title}
                    </h3>

                    {/* Time-lapse animation container */}
                    <div className="space-y-3 mb-4">
                      {/* Animated task items */}
                      {[
                        { delay: '0s', duration: '1.2s' },
                        { delay: '0.4s', duration: '1s' },
                        { delay: '0.8s', duration: '0.8s' },
                        { delay: '1.2s', duration: '0.6s' },
                      ].map((timing, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3"
                          style={{
                            animation: `fadeInSlide 0.3s ease-out ${timing.delay} forwards`,
                            opacity: 0,
                          }}
                        >
                          {/* Animated checkmark */}
                          <div
                            className="w-5 h-5 rounded-full bg-green-500/20 dark:bg-green-400/20 flex items-center justify-center flex-shrink-0"
                            style={{
                              animation: `checkPop 0.3s ease-out ${parseFloat(timing.delay) + 0.2}s forwards`,
                              transform: 'scale(0)',
                            }}
                          >
                            <svg
                              className="w-3 h-3 text-green-600 dark:text-green-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>

                          {/* Animated progress bar */}
                          <div className="flex-1 h-2 bg-white/20 dark:bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{
                                animation: `progressFill ${timing.duration} ease-out ${timing.delay} forwards`,
                                width: '0%',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {card.description}
                    </p>

                    {/* Floating particles */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `floatUp ${2 + Math.random() * 2}s ease-out ${Math.random() * 2}s infinite`,
                            opacity: 0,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Add blurred background container for Speed card (index 1) */}
                    <div className={index === 1 ? 'bg-white/30 dark:bg-white/10 backdrop-blur-xl rounded-xl p-6 -m-2 border border-white/20 dark:border-white/10' : ''}>
                      {/* Label - Hidden for Speed card (index 1) */}
                      {index !== 1 && (
                        <div className="mb-4">
                          <span className="inline-block px-3 py-1 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30 rounded-full">
                            {card.label}
                          </span>
                        </div>
                      )}

                      {/* Title with optional animation */}
                      <h3
                        className={`
                          text-2xl font-bold mb-3 text-zinc-900 dark:text-white
                          ${index === 1 ? 'animate-slide-left' : ''}
                          ${index === 2 ? 'animate-typewriter' : ''}
                          ${index === 3 ? 'animate-split-reveal' : ''}
                          ${index === 4 ? 'animate-fade-scale' : ''}
                        `}
                      >
                        {card.title}
                      </h3>

                      {/* Description with optional animation */}
                      <p
                        className={`
                          text-base text-zinc-600 dark:text-zinc-400 leading-relaxed
                          ${card.animateDescription ? 'animate-text-reveal animation-delay-200' : ''}
                        `}
                      >
                        {card.description}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />
            </div>
            );

            // Grid Position Mapping
            // Each card gets specific grid positioning based on its index
            // IMPORTANT: We need explicit grid-row-start to control vertical placement
            const gridPositions = {
              0: {
                // INSIGHTS - Top Left (Medium Square)
                className: "lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-1",
                description: "Insights card: Columns 1-2, Rows 1-2",
              },
              1: {
                // SPEED - Middle Left (Short Rectangle) 
                className: "lg:col-span-2 lg:row-span-1 lg:col-start-1 lg:row-start-3",
                description: "Speed card: Columns 1-2, Row 3",
              },
              2: {
                // PRODUCTIVITY - Right Side (Tall Rectangle)
                className: "lg:col-span-2 lg:row-span-3 lg:col-start-3 lg:row-start-1",
                description: "Productivity card: Columns 3-4, Rows 1-3",
              },
              3: {
                // SECURITY - Bottom Left (Medium Square)
                className: "lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-4",
                description: "Security card: Columns 1-2, Rows 4-5",
              },
              4: {
                // COMING SOON - Bottom Right (Medium Square)
                className: "lg:col-span-2 lg:row-span-2 lg:col-start-3 lg:row-start-4",
                description: "Coming Soon card: Columns 3-4, Rows 4-5",
              },
            };

            const position = gridPositions[index as keyof typeof gridPositions];

            return (
              <div 
                key={index} 
                className={position?.className || ""}
                title={position?.description}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        /* Insights - Subtle zoom-in effect */
        .zoom-start {
          transform: scale(1.3) translateZ(0);
          opacity: 0.5;
        }

        .zoom-complete {
          transform: scale(1) translateZ(0);
          opacity: 1;
        }

        .title-hidden {
          opacity: 0;
          transform: translateY(10px);
        }

        .title-reveal {
          opacity: 1;
          transform: translateY(0);
          transition-delay: 0.3s;
        }

        /* Speed - Slide from left */
        @keyframes slide-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slide-left {
          animation: slide-left 0.6s ease-out;
        }

        /* Productivity - Typewriter effect */
        @keyframes typewriter {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }

        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          animation: typewriter 1s steps(20) forwards;
        }

        /* Security - Fade with scale */
        @keyframes fade-scale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-scale {
          animation: fade-scale 0.7s ease-out;
        }

        /* Accuracy - Split reveal */
        @keyframes split-reveal {
          from {
            opacity: 0;
            letter-spacing: 0.5em;
            filter: blur(8px);
          }
          to {
            opacity: 1;
            letter-spacing: normal;
            filter: blur(0);
          }
        }

        .animate-split-reveal {
          animation: split-reveal 0.8s ease-out;
        }

        /* Innovation - Glitch effect */
        @keyframes glitch {
          0%, 100% {
            opacity: 1;
            transform: translate(0);
          }
          20% {
            opacity: 0.8;
            transform: translate(-2px, 2px);
          }
          40% {
            opacity: 0.8;
            transform: translate(2px, -2px);
          }
          60% {
            opacity: 0.8;
            transform: translate(-2px, -2px);
          }
          80% {
            opacity: 0.8;
            transform: translate(2px, 2px);
          }
        }

        .animate-glitch {
          animation: glitch 0.5s ease-in-out;
        }

        /* Original text reveal animation for descriptions */
        @keyframes text-reveal {
          from {
            opacity: 0;
            transform: translateY(10px);
            filter: blur(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        .animate-text-reveal {
          animation: text-reveal 0.8s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        /* Label - Subtle pulse animation */
        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.9;
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 3s ease-in-out infinite;
        }

        /* Security Lock Animations */
        @keyframes security-pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.1;
          }
        }

        .animate-security-pulse {
          animation: security-pulse 2s ease-in-out infinite;
        }

        @keyframes security-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-security-float {
          animation: security-float 3s ease-in-out infinite;
        }

        @keyframes security-particle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1) translateX(-5px);
          }
        }

        .animate-security-particle {
          animation: security-particle 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}
