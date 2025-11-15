"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useInView } from "@/hooks/useInView";

/**
 * HeroImage Component
 * 
 * Displays the hero screenshot with theme-aware image switching.
 * Features glassmorphic design with hover effects and animated glow line at bottom.
 */

export default function HeroImage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";
  
  // Prevent hydration mismatch by only showing theme-dependent content after mount
  useEffect(() => {
    // Use a microtask to avoid cascading renders
    Promise.resolve().then(() => setMounted(true));
  }, []);
  
  const { ref: imageRef, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <div 
      ref={imageRef}
      className={`w-full max-w-7xl mx-auto mb-24 transition-all duration-1000 ${
        inView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      }`}
    >
      <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative w-full aspect-21/9">
          {/* Light mode image */}
          <Image
            src="/light-new.png"
            alt="TellMeMore Interface - Light Mode"
            fill
            className={`object-cover object-top transition-opacity duration-700 ease-out ${
              mounted && isDark ? "opacity-0" : "opacity-100"
            }`}
            style={{ 
              maskImage: 'linear-gradient(to top, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 50%)'
            }}
            priority
          />
          {/* Dark mode image */}
          <Image
            src="/dark-new.png"
            alt="TellMeMore Interface - Dark Mode"
            fill
            className={`object-cover object-top transition-opacity duration-700 ease-out ${
              mounted && isDark ? "opacity-100" : "opacity-0"
            }`}
            style={{ 
              maskImage: 'linear-gradient(to top, transparent 0%, black 50%)',
              WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 50%)'
            }}
            priority
          />
        </div>
        
        {/* Bottom glow line with center star and beam pulses */}
        <div className="absolute bottom-0 inset-x-0 h-px overflow-hidden">
          {/* Base glow line */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-blue-500 dark:via-blue-400 to-transparent opacity-60" />
          
          {/* Center star glow - constantly glowing */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-sm animate-pulse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full blur-md opacity-80 animate-pulse" />
          
          {/* Beam pulse to the right */}
          <div className="absolute inset-0 bg-linear-to-r from-transparent from-50% via-white to-transparent animate-beam-right" />
          
          {/* Beam pulse to the left */}
          <div className="absolute inset-0 bg-linear-to-l from-transparent from-50% via-white to-transparent animate-beam-left" />
        </div>
      </div>
    </div>
  );
}
