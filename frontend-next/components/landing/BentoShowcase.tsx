'use client';

import React, { useState, useEffect } from 'react';
import { ShootingStars } from '../ui/shooting-stars';
import ElectricBorder from '../ElectricBorder';
import { Highlight } from '../ui/hero-highlight';
import Hyperspeed from '../Hyperspeed';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Mail } from 'lucide-react';
import { useInView } from '@/hooks/useInView';

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
 * Index 0: INSIGHTS     - Top Left       (col 1, row 1) - Small square
 * Index 1: SPEED        - Top Middle-Left(col 2, row 1) - Small square, next to Insights
 * Index 2: PRODUCTIVITY - Right Side     (cols 3-4, rows 1-4) - Tall rectangle
 * Index 3: SECURITY     - Left Side      (cols 1-2, rows 2-4) - Tall rectangle, starts row 2
 * Index 4: COMING SOON  - Bottom Right   (cols 3-4, row 5) - Medium rectangle
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
    label: 'Flexibility',
    title: 'Your Way, Your Choice',
    description: 'Switch between models instantly, no lock-in',
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
  
  // Scroll-triggered animation
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    // Trigger zoom effect only when section is in view
    if (inView) {
      const timer = setTimeout(() => {
        setInsightsZoomed(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [inView]);

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl w-full">
        {/* Section Header */}
        <div className={`text-center mb-12 md:mb-16 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
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
            
            Column:    1           2           3           4
            ┌──────────┬──────────┬──────────────────────┐
            │ INSIGHTS │  SPEED   │                      │  Row 1
            │ (1col×1) │ (1col×1) │   PRODUCTIVITY       │
            ├──────────┴──────────┤   (2col×4row)        │  Row 2
            │                     │                      │
            │    SECURITY         │                      │  Row 3
            │    (2col×4row)      │                      │
            │                     │                      │  Row 4
            │                     ├──────────────────────┤
            │                     │  COMING SOON         │  Row 5
            └─────────────────────┴──────────────────────┘
                                  │  (2col×1row)         │
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {cardData.map((card, index) => {
            // Staggered animation delay for each card
            const animationDelay = inView ? `${index * 100}ms` : '0ms';
            
            // Base card styling - shared by all cards
            const cardContent = (
              <div
                className={`
                  relative group h-full
                  flex flex-col justify-between
                  p-8 rounded-2xl
                  border border-white/20 dark:border-white/10
                  bg-white/50 dark:bg-black/50
                  backdrop-blur-xl
                  transition-all duration-700 ease-out
                  hover:-translate-y-1
                  hover:shadow-lg hover:shadow-purple-500/20
                  overflow-hidden
                  ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
                `}
                style={{
                  transitionDelay: animationDelay,
                }}
              >
                {/* Shooting Stars Background - Skip for Speed card (index 1) */}
                {index !== 1 && (
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
                )}

                {/* Time-lapse Animation for Productivity Card */}
                {index === 2 && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                    {/* Animated Progress Bars */}
                    <div className="absolute top-1/4 left-8 right-8 space-y-4">
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-fast" style={{ width: '0%' }} />
                      </div>
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-medium" style={{ width: '0%' }} />
                      </div>
                      <div className="h-2 bg-white/10 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-linear-to-r from-purple-500 to-cyan-500 rounded-full animate-progress-slow" style={{ width: '0%' }} />
                      </div>
                    </div>
                    
                    {/* Animated Checkmarks */}
                    <div className="absolute top-1/2 left-8 space-y-3">
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '0.5s' }}>
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="h-1.5 w-32 bg-white/10 dark:bg-white/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '1s' }}>
                        <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center">
                          <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="h-1.5 w-24 bg-white/10 dark:bg-white/5 rounded" />
                      </div>
                      <div className="flex items-center gap-2 animate-check-appear" style={{ animationDelay: '1.5s' }}>
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

                {/* Shuffle/Switch Icon for Flexibility Card - Right Side */}
                {index === 3 && (
                  <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ElectricBorder
                      color="#10b981"
                      speed={1}
                      chaos={0.5}
                      thickness={2}
                      style={{ borderRadius: 16 }}
                    >
                      <div className="relative p-8 bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl">
                        {/* Glowing ring behind shuffle icon */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-32 h-32 rounded-2xl border-2 border-green-500/30 animate-security-pulse" />
                        </div>
                        
                        {/* Shuffle/Switch icon - Circular arrows showing model switching */}
                        <svg
                          className="w-24 h-24 text-green-500/60 animate-security-float relative z-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          {/* Circular refresh/switch arrows */}
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                          />
                        </svg>
                        
                        {/* Small particles around shuffle icon */}
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-green-500 rounded-full animate-security-particle"
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
                  <div 
                    className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0"
                  >
                    <Hyperspeed
                      effectOptions={{
                            onSpeedUp: () => {},
                            onSlowDown: () => {},
                            distortion: 'turbulentDistortion',
                            length: 400,
                            roadWidth: 10,
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
                            roadColor: 0x1a1a2e,
                            islandColor: 0x16213e,
                            background: 0x0f0f1e,
                            shoulderLines: 0x2d4059,
                            brokenLines: 0x2d4059,
                            leftCars: [0xff6b35, 0xf7931e, 0xff4757],
                            rightCars: [0x5f27cd, 0x54a0ff, 0x48dbfb],
                            sticks: 0x48dbfb
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
                      <Badge 
                        variant="secondary" 
                        className="relative overflow-hidden group/label cursor-pointer transition-all duration-300 hover:scale-110 hover:rotate-2 animate-pulse-subtle text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30"
                      >
                        {/* Shimmer effect overlay */}
                        <span className="absolute inset-0 -translate-x-full group-hover/label:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                        <span className="relative z-10">{card.label}</span>
                      </Badge>
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
                      <Badge 
                        variant="secondary"
                        className="text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30"
                      >
                        {card.label}
                      </Badge>
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
                            className="w-5 h-5 rounded-full bg-green-500/20 dark:bg-green-400/20 flex items-center justify-center shrink-0"
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
                              className="h-full bg-linear-to-r from-purple-500 to-blue-500 rounded-full"
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

                    {/* Floating particles - Using fixed positions to avoid hydration mismatch */}
                    <div className="absolute inset-0 pointer-events-none">
                      {[
                        { left: '15%', top: '20%', duration: '3.2s', delay: '0.5s' },
                        { left: '85%', top: '15%', duration: '2.8s', delay: '1.2s' },
                        { left: '25%', top: '60%', duration: '3.5s', delay: '0.8s' },
                        { left: '70%', top: '75%', duration: '2.5s', delay: '1.5s' },
                        { left: '45%', top: '30%', duration: '3.0s', delay: '0.3s' },
                        { left: '90%', top: '85%', duration: '2.7s', delay: '1.0s' },
                        { left: '35%', top: '50%', duration: '3.3s', delay: '0.6s' },
                        { left: '60%', top: '90%', duration: '2.9s', delay: '1.8s' },
                      ].map((particle, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-purple-400 rounded-full"
                          style={{
                            left: particle.left,
                            top: particle.top,
                            animation: `floatUp ${particle.duration} ease-out ${particle.delay} infinite`,
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
                          <Badge 
                            variant="secondary"
                            className="text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-900/30"
                          >
                            {card.label}
                          </Badge>
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
                      
                      {/* "Stay in Contact" Button for Coming Soon card (index 4) */}
                      {index === 4 && (
                        <div className="mt-6">
                          <Button
                            variant="default"
                            size="lg"
                            className="relative overflow-hidden bg-linear-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white group"
                            asChild
                          >
                            <a href="mailto:contact@tellmemore.com" className="flex items-center gap-2">
                              {/* Shimmer effect */}
                              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                              <Mail className="w-5 h-5" />
                              <span className="relative z-10">Stay in Contact for Updates</span>
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-linear-to-br from-purple-500/0 via-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:via-purple-500/5 group-hover:to-transparent transition-all duration-500 rounded-2xl pointer-events-none" />
            </div>
            );

            // Grid Position Mapping
            // Each card gets specific grid positioning based on its index
            // IMPORTANT: We need explicit grid-row-start to control vertical placement
            const gridPositions = {
              0: {
                // INSIGHTS - Top Left (Small Square)
                className: "lg:col-span-1 lg:row-span-1 lg:col-start-1 lg:row-start-1",
                description: "Insights card: Column 1, Row 1",
              },
              1: {
                // SPEED - Top Middle-Left (Small Square) - Next to Insights
                className: "lg:col-span-1 lg:row-span-1 lg:col-start-2 lg:row-start-1",
                description: "Speed card: Column 2, Row 1",
              },
              2: {
                // PRODUCTIVITY - Right Side (Tall Rectangle - 4 rows)
                className: "lg:col-span-2 lg:row-span-4 lg:col-start-3 lg:row-start-1",
                description: "Productivity card: Columns 3-4, Rows 1-4",
              },
              3: {
                // SECURITY - Left Side (Tall Rectangle - 4 rows, starts at row 2)
                className: "lg:col-span-2 lg:row-span-4 lg:col-start-1 lg:row-start-2",
                description: "Security card: Columns 1-2, Rows 2-5",
              },
              4: {
                // COMING SOON - Bottom Right (Medium Rectangle)
                className: "lg:col-span-2 lg:row-span-1 lg:col-start-3 lg:row-start-5",
                description: "Coming Soon card: Columns 3-4, Row 5",
              },
            };

            const position = gridPositions[index as keyof typeof gridPositions];

            return (
              <div 
                key={index} 
                className={`${position?.className || ""} h-full`}
                title={position?.description}
              >
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
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

        /* Progress Bar Animations */
        @keyframes progress-fast {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        .animate-progress-fast {
          animation: progress-fast 2s ease-out forwards;
        }

        @keyframes progress-medium {
          from {
            width: 0%;
          }
          to {
            width: 80%;
          }
        }

        .animate-progress-medium {
          animation: progress-medium 2.5s ease-out forwards;
        }

        @keyframes progress-slow {
          from {
            width: 0%;
          }
          to {
            width: 65%;
          }
        }

        .animate-progress-slow {
          animation: progress-slow 3s ease-out forwards;
        }

        /* Checkmark Appear Animation */
        @keyframes check-appear {
          from {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        .animate-check-appear {
          animation: check-appear 0.5s ease-out forwards;
        }
      `}</style>
    </section>
  );
}
