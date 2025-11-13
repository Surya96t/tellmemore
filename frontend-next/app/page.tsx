"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundEffects from "@/components/landing/BackgroundEffects";
import HeroSection from "@/components/landing/HeroSection";
import HeroImage from "@/components/landing/HeroImage";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import BentoShowcase from "@/components/landing/BentoShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import FinalCTA from "@/components/landing/FinalCTA";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      {/* Navbar - Fixed at top */}
      {/*<Navbar />*/}

      {/* Background Effects */}
      <BackgroundEffects />

      {/* Main Content */}
      <main className="relative z-10">

        <Navbar />

        {/* Hero Section with screenshot */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pt-5">
          <HeroSection />
          <HeroImage />
        </section>

        {/* Bento Showcase */}
        <section id="features">
          <BentoShowcase />
        </section>

        {/* Features Section - Why Choose TellMeMore */}
        <section id="why-choose">
          <FeaturesGrid />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works">
          <HowItWorks />
        </section>

        {/* Pricing */}
        {/*<Pricing />*/}

        {/* Stats/Social Proof Section */}
        {/*<StatsSection />*/}

        {/* Final CTA Section */}
        <FinalCTA />

        <Footer />
      </main>

      {/* Footer */}
      {/*<Footer />*/}
    </div>
  );
}
