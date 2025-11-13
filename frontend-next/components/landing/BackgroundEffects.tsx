/**
 * BackgroundEffects Component
 * 
 * Animated gradient blobs and glass overlay for the landing page background.
 * Creates a modern, vibrant backdrop with multiple animated gradient blobs,
 * grid pattern, and frosted glass overlay.
 */

'use client'

import { motion } from 'framer-motion'

export default function BackgroundEffects() {
  return (
    <>
      {/* Modern Gradient Background - Enhanced with animated blobs on circular paths */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* LARGE SLOW BLOB #1 - Wide elliptical orbit (clockwise) */}
        <motion.div 
          className="absolute top-0 -left-40 w-[700px] h-[700px] bg-blue-500/50 dark:bg-blue-500/60 rounded-full blur-3xl"
          animate={{
            x: [0, 400, 400, 0, -400, -400, 0],
            y: [0, 0, 300, 400, 300, 0, 0],
            scale: [1, 1.2, 1.5, 1.3, 1.1, 0.8, 1],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* LARGE SLOW BLOB #2 - Large circular orbit with rotation (counter-clockwise) */}
        <motion.div 
          className="absolute -bottom-40 left-20 w-[700px] h-[700px] bg-indigo-500/45 dark:bg-indigo-500/55 rounded-full blur-3xl"
          animate={{
            x: [0, -300, -350, -300, 0, 300, 350, 300, 0],
            y: [0, 0, -300, -350, -400, -350, -300, 0, 0],
            scale: [1, 1.1, 1.4, 1.2, 1.0, 0.9, 0.8, 1.1, 1],
            rotate: [0, 45, 90, 135, 180, 225, 270, 315, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* MEDIUM FAST BLOB - Tight circular orbit (fast clockwise) */}
        <motion.div 
          className="absolute top-0 -right-40 w-[500px] h-[500px] bg-purple-500/50 dark:bg-purple-500/60 rounded-full blur-3xl"
          animate={{
            x: [0, 250, 350, 250, 0, -250, -350, -250, 0],
            y: [0, 0, 250, 350, 400, 350, 250, 0, 0],
            scale: [1, 1.3, 1.8, 1.5, 1.2, 0.8, 0.6, 0.9, 1],
            rotate: [0, 60, 120, 180, 240, 300, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* MEDIUM BLOB - Figure-8 pattern (lemniscate) */}
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-pink-500/40 dark:bg-pink-500/50 rounded-full blur-3xl"
          animate={{
            x: [0, 300, 400, 300, 0, -300, -400, -300, 0],
            y: [0, -200, 0, 200, 0, 200, 0, -200, 0],
            scale: [1, 1.4, 1.6, 1.2, 1, 1.3, 0.7, 0.9, 1],
            rotate: [0, 90, 180, 270, 360, 450, 540],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* SMALL SUPER FAST BLOB - Small tight circle (super fast) */}
        <motion.div 
          className="absolute top-1/3 right-1/3 w-[250px] h-[250px] bg-cyan-500/60 dark:bg-cyan-500/70 rounded-full blur-2xl"
          animate={{
            x: [0, 200, 280, 200, 0, -200, -280, -200, 0],
            y: [0, 0, 200, 280, 300, 280, 200, 0, 0],
            scale: [1, 1.8, 2.2, 1.6, 1.2, 0.7, 0.5, 0.8, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* TINY HYPER FAST BLOB - Erratic oval (lightning speed) */}
        <motion.div 
          className="absolute top-1/4 right-1/4 w-[200px] h-[200px] bg-yellow-500/50 dark:bg-yellow-500/60 rounded-full blur-2xl"
          animate={{
            x: [0, 180, 250, 180, 0, -180, -250, -180, 0],
            y: [0, -150, 0, 150, 200, 150, 0, -150, 0],
            scale: [1, 1.8, 2.5, 1.9, 1.3, 0.6, 0.4, 0.7, 1],
            rotate: [0, 120, 240, 360, 480, 600, 720],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* MEDIUM MODERATE BLOB - Horizontal ellipse (moderate pace) */}
        <motion.div 
          className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-violet-500/40 dark:bg-violet-500/50 rounded-full blur-3xl"
          animate={{
            x: [0, 350, 450, 350, 0, -350, -450, -350, 0],
            y: [0, -150, 0, 150, 220, 150, 0, -150, 0],
            scale: [1, 1.2, 1.7, 1.4, 1.1, 0.8, 0.6, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* EXTRA TINY CHAOTIC BLOB - Spiral-like circular motion */}
        <motion.div 
          className="absolute bottom-1/3 right-1/4 w-[180px] h-[180px] bg-emerald-500/60 dark:bg-emerald-500/70 rounded-full blur-xl"
          animate={{
            x: [0, 150, 200, 150, 0, -150, -200, -150, 0],
            y: [0, -100, 0, 100, 180, 100, 0, -100, 0],
            scale: [1, 2.0, 3.0, 2.2, 1.5, 0.8, 0.3, 0.6, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Animated gradient overlay for shimmer effect */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Darker Grid pattern overlay for better visibility */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-size-[24px_24px]" />
        
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20 dark:to-black/20" />
      </div>

      {/* Reduced Frosted Glass Overlay - Lighter for better content visibility */}
      <div className="fixed inset-0 z-5 pointer-events-none bg-white/10 dark:bg-black/20 backdrop-blur-[2px]" />
    </>
  );
}
