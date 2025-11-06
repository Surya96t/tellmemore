"use client";
import Beams from "@/components/Beams";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import MagicBento from "@/components/MagicBento";
import SocialProof from "@/components/SocialProof";
import Pricing from "@/components/Pricing";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";


export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-black overflow-x-hidden">
      {/* Hero Section with Beams background and Navbar on top */}
      <section className="relative w-full flex flex-col items-center justify-center min-h-[600px]">
        <div className="absolute inset-0 pointer-events-none">
          <Beams
            beamWidth={3}
            beamHeight={30}
            beamNumber={20}
            lightColor="#0078d4"
            speed={2}
            noiseIntensity={1.75}
            scale={0.2}
            rotation={30}
          />
        </div>
        <Navbar />
        <HeroSection />
      </section>
      {/* Features Section below Hero */}
      <main className="flex flex-col items-center w-full">
        <Features />
        <HowItWorks />
        <MagicBento />
        <SocialProof />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
