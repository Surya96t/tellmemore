"use client";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BentoShowcase from "@/components/BentoShowcase";
import Pricing from "@/components/Pricing";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Modern Gradient Background - Enhanced with more layers */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Multiple gradient blobs with animation - More vibrant */}
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] bg-blue-500/40 dark:bg-blue-500/50 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 -right-40 w-[600px] h-[600px] bg-purple-500/40 dark:bg-purple-500/50 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 left-20 w-[600px] h-[600px] bg-indigo-500/40 dark:bg-indigo-500/50 rounded-full blur-3xl animate-blob animation-delay-4000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-pink-500/30 dark:bg-pink-500/40 rounded-full blur-3xl animate-blob animation-delay-1000" />
        
        {/* Additional accent blobs for more depth */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/30 dark:bg-cyan-500/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 left-1/3 w-[500px] h-[500px] bg-violet-500/30 dark:bg-violet-500/40 rounded-full blur-3xl animate-blob animation-delay-1000" />
        
        {/* Animated gradient overlay for shimmer effect */}
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-transparent to-purple-500/5 animate-pulse" style={{ animationDuration: '8s' }} />
        
        {/* Darker Grid pattern overlay for better visibility */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808025_1px,transparent_1px),linear-gradient(to_bottom,#80808025_1px,transparent_1px)] bg-size-[24px_24px]" />
        
        {/* Subtle radial gradient for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-white/20 dark:to-black/20" />
      </div>

      {/* Reduced Frosted Glass Overlay - Lighter for better content visibility */}
      <div className="fixed inset-0 z-[5] pointer-events-none bg-white/10 dark:bg-black/20 backdrop-blur-[2px]" />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section with screenshot */}
        <section className="w-full px-4 sm:px-6 lg:px-8 pt-5">
          <HeroSection />
          
          {/* Hero Image - Screenshot with glass effect */}
          <div className="w-full max-w-7xl mx-auto mb-24">
            <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative w-full aspect-[21/9]">
                {/* Light mode image */}
                <Image
                  src="/light-new.png"
                  alt="TellMeMore Interface - Light Mode"
                  fill
                  className={`object-cover object-top transition-opacity duration-700 ease-out ${
                    isDark ? "opacity-0" : "opacity-100"
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
                    isDark ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ 
                    maskImage: 'linear-gradient(to top, transparent 0%, black 50%)',
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 50%)'
                  }}
                  priority
                />
              </div>
              {/* Bottom glow line */}
              {/* Bottom glow line with center star and beam pulses */}
              <div className="absolute bottom-0 inset-x-0 h-px overflow-hidden">
                {/* Base glow line */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 dark:via-blue-400 to-transparent opacity-60" />
                
                {/* Center star glow - constantly glowing */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-sm animate-pulse" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-400 rounded-full blur-md opacity-80 animate-pulse" />
                
                {/* Beam pulse to the right */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent from-50% via-white to-transparent animate-beam-right" />
                
                {/* Beam pulse to the left */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent from-50% via-white to-transparent animate-beam-left" />
              </div>
            </div>
          </div>
        </section>


        {/* Features Section - Modern Glassmorphism Design */}
        <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                Why Choose TellMeMore?
              </h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                The essential features that make TellMeMore the best multi-model AI chat platform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 - Multi-Model Comparison */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-blue-500/20 dark:bg-blue-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    See All Perspectives
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Get responses from GPT-4, Google Gemini, and Groq LLaMA3 simultaneously to make better-informed decisions.
                  </p>
                </div>
              </div>

              {/* Feature 2 - Session Management */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-purple-500/20 dark:bg-purple-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Organize Your Conversations
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Keep track of all your chats with intelligent session management. Search, rename, and seamlessly switch between conversations.
                  </p>
                </div>
              </div>

              {/* Feature 3 - Custom Prompts */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-indigo-500/20 dark:bg-indigo-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Craft Perfect Prompts
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Create and save custom prompts for repeated tasks. Access our library of system prompts or build your own templates.
                  </p>
                </div>
              </div>

              {/* Feature 4 - Quota Management */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-pink-500/10 to-red-500/10 dark:from-pink-500/20 dark:to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-pink-500/20 dark:bg-pink-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Transparent Quota
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Clear visibility into your token usage with real-time tracking. Fair, predictable access to all AI models without hidden costs.
                  </p>
                </div>
              </div>

              {/* Feature 5 - Performance */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-green-500/20 dark:bg-green-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Smart & Fast
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Experience lightning-fast responses with intelligent caching and optimized API calls. No waiting, just answers.
                  </p>
                </div>
              </div>

              {/* Feature 6 - Security */}
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/10 to-yellow-500/10 dark:from-orange-500/20 dark:to-yellow-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-orange-500/20 dark:bg-orange-500/30 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Secure & Private
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Your conversations are encrypted and private. We never train AI models on your data or share it with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Showcase */}
        <BentoShowcase />

        {/* How It Works Section */}
        <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                How It Works
              </h2>
              <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Get started in three simple steps and experience the power of multiple AI minds.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Step 1 */}
              <div className="relative text-center">
                <div className="mx-auto w-20 h-20 bg-linear-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">1</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  Sign Up
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Create your free account in seconds. No credit card required to get started with your AI journey.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative text-center">
                <div className="mx-auto w-20 h-20 bg-linear-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">2</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  Ask Questions
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Type your question once and see responses from GPT-4, Gemini, and LLaMA3 side-by-side in real-time.
                </p>
              </div>

              {/* Step 3 */}
              <div className="relative text-center">
                <div className="mx-auto w-20 h-20 bg-linear-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">3</span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                  Compare Answers
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Analyze different perspectives, choose the best answer, and make better decisions faster.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <Pricing />

        {/* Stats/Social Proof Section */}
        <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Stat 1 */}
              <div className="text-center">
                <div className="text-5xl font-bold bg-linear-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                  10K+
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">Active Users</p>
              </div>

              {/* Stat 2 */}
              <div className="text-center">
                <div className="text-5xl font-bold bg-linear-to-br from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                  1M+
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">Questions Answered</p>
              </div>

              {/* Stat 3 */}
              <div className="text-center">
                <div className="text-5xl font-bold bg-linear-to-br from-pink-600 to-red-600 dark:from-pink-400 dark:to-red-400 bg-clip-text text-transparent mb-2">
                  3
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">AI Models</p>
              </div>

              {/* Stat 4 */}
              <div className="text-center">
                <div className="text-5xl font-bold bg-linear-to-br from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <p className="text-zinc-600 dark:text-zinc-400">Uptime</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="w-full py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-500/30 dark:to-purple-500/30 rounded-3xl blur-3xl" />
              <div className="relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-12">
                <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-4">
                  Ready to Get Better Answers?
                </h2>
                <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-2xl mx-auto">
                  Join thousands of users who make smarter decisions with TellMeMore. Start comparing AI responses today.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/sign-up"
                    className="px-8 py-4 rounded-xl font-semibold text-white bg-linear-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Start Comparing Now
                  </Link>
                  <Link
                    href="#features"
                    className="px-8 py-4 rounded-xl font-semibold text-zinc-900 dark:text-white bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-black transition-all hover:scale-105"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
