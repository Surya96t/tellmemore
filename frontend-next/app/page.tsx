"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ===== OLD COMPONENTS (COMMENTED OUT) =====
// import Features from "@/components/Features";
// import HowItWorks from "@/components/HowItWorks";
// import MagicBento from "@/components/MagicBento";
// import SocialProof from "@/components/SocialProof";
// import FinalCTA from "@/components/FinalCTA";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Modern Gradient Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Multiple gradient blobs with animation */}
        <div className="absolute top-0 -left-40 w-[500px] h-[500px] bg-blue-500/30 dark:bg-blue-500/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-40 w-[500px] h-[500px] bg-purple-500/30 dark:bg-purple-500/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-[500px] h-[500px] bg-indigo-500/30 dark:bg-indigo-500/40 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/20 dark:bg-pink-500/30 rounded-full blur-3xl animate-blob animation-delay-1000" />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with animated text */}
        <section className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          <HeroSection />
          
          {/* Screenshot Card - Right below hero */}
          <div className="w-full max-w-7xl mx-auto mt-8">
            {/* Glassmorphism container - increased transparency */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-black/5 backdrop-blur-xl">
              {/* Theme-aware screenshot */}
              <div className="relative w-full">
                {/* Light mode image - delayed animation */}
                <Image
                  src="/light-new.png"
                  alt="TellMeMore Interface - Light Mode"
                  width={1920}
                  height={1080}
                  className={`w-full h-auto transition-all duration-700 ease-out ${
                    isDark ? "opacity-0 absolute inset-0" : "opacity-100 animate-fade-in animation-delay-1200"
                  }`}
                  priority
                />
                {/* Dark mode image - delayed animation */}
                <Image
                  src="/dark-new.png"
                  alt="TellMeMore Interface - Dark Mode"
                  width={1920}
                  height={1080}
                  className={`w-full h-auto transition-all duration-700 ease-out ${
                    isDark ? "opacity-100 animate-fade-in animation-delay-1200" : "opacity-0 absolute inset-0"
                  }`}
                  priority
                />
                
                {/* Gradient blur overlay - starts at 30% from top */}
                <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-white/80 dark:to-black/80 pointer-events-none" />
                <div className="absolute inset-0 backdrop-blur-[2px] mask-[linear-gradient(to_bottom,transparent_0%,transparent_30%,black_100%)] pointer-events-none" />
              </div>
            </div>
          </div>
        </section>

        {/* ===== YOUR NEW SECTIONS GO HERE ===== */}
        
      </main>

      {/* Footer */}
      <Footer />

      {/* ========================================= */}
      {/* OLD LANDING PAGE - COMMENTED OUT */}
      {/* ========================================= */}
      {/* 
      <section className="relative w-full flex flex-col items-center justify-center min-h-screen">
        <HeroSection />
      </section>
      <main className="flex flex-col items-center w-full">
        <Features />
        <HowItWorks />
        <MagicBento />
        <SocialProof />
        <FinalCTA />
      </main>
      */}
    </div>
  );
}
