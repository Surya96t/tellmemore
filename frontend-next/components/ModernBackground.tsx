"use client";

import { useEffect, useRef } from "react";

interface ModernBackgroundProps {
  variant?: "light" | "dark";
}

export default function ModernBackground({ variant = "dark" }: ModernBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Gradient blob configuration
    const blobs = [
      { x: 0.2, y: 0.3, radius: 0.4, speed: 0.0002, angle: 0 },
      { x: 0.8, y: 0.6, radius: 0.35, speed: 0.00015, angle: Math.PI },
      { x: 0.5, y: 0.8, radius: 0.3, speed: 0.00025, angle: Math.PI / 2 },
    ];

    // Colors based on variant
    const colors = variant === "dark" 
      ? {
          bg: "#000000",
          blob1: "rgba(0, 120, 212, 0.25)", // Blue - increased opacity
          blob2: "rgba(99, 102, 241, 0.20)", // Indigo - increased opacity
          blob3: "rgba(139, 92, 246, 0.18)",  // Purple - increased opacity
        }
      : {
          bg: "#fafafa",
          blob1: "rgba(59, 130, 246, 0.12)",  // Blue - increased opacity
          blob2: "rgba(99, 102, 241, 0.10)",  // Indigo - increased opacity
          blob3: "rgba(139, 92, 246, 0.08)",  // Purple - increased opacity
        };

    let animationFrameId: number;

    const animate = () => {
      // Clear canvas with background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw blobs
      blobs.forEach((blob, index) => {
        // Update position
        blob.angle += blob.speed;
        const centerX = blob.x + Math.cos(blob.angle) * 0.1;
        const centerY = blob.y + Math.sin(blob.angle) * 0.1;

        // Draw gradient blob
        const gradient = ctx.createRadialGradient(
          centerX * canvas.width,
          centerY * canvas.height,
          0,
          centerX * canvas.width,
          centerY * canvas.height,
          blob.radius * Math.max(canvas.width, canvas.height)
        );

        const color = index === 0 ? colors.blob1 : index === 1 ? colors.blob2 : colors.blob3;
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw grid pattern overlay
      ctx.strokeStyle = variant === "dark" ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 50;

      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [variant]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ filter: "blur(80px)" }}
    />
  );
}
