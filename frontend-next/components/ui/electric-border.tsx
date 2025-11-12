'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElectricBorderProps {
  children: React.ReactNode;
  className?: string;
  borderColor?: string;
  borderWidth?: number;
  duration?: number;
  intensity?: number;
}

export function ElectricBorder({
  children,
  className,
  borderColor = '#8400ff',
  borderWidth = 2,
  duration = 3,
  intensity = 1,
}: ElectricBorderProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Animated border container */}
      <div
        className="absolute inset-0 rounded-inherit overflow-hidden pointer-events-none"
        style={{
          padding: `${borderWidth}px`,
        }}
      >
        {/* Electric border effect */}
        <div
          className="absolute inset-0 animate-electric-border"
          style={{
            background: `linear-gradient(90deg, 
              transparent 0%, 
              ${borderColor} 50%, 
              transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: `electric-border ${duration}s linear infinite`,
            opacity: intensity,
          }}
        />
        
        {/* Mask to create border effect */}
        <div className="absolute inset-[1px] bg-white dark:bg-black rounded-inherit" />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style jsx>{`
        @keyframes electric-border {
          0% {
            background-position: 200% 0%;
          }
          100% {
            background-position: -200% 0%;
          }
        }
      `}</style>
    </div>
  );
}
