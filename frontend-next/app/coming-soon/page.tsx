"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Bell } from "lucide-react";
import { ShootingStars } from "@/components/ui/shooting-stars";

export default function ComingSoon() {
  return (
    <div className="relative min-h-screen w-full bg-white dark:bg-black flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ShootingStars
          minSpeed={10}
          maxSpeed={30}
          minDelay={1000}
          maxDelay={3000}
          starColor="#9E00FF"
          trailColor="#2EB9DF"
        />
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
            <div className="relative w-24 h-24 bg-linear-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
              <Bell className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-zinc-900 dark:text-white mb-6">
          <span className="bg-clip-text text-transparent bg-linear-to-br from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            Coming Soon
          </span>
        </h1>

        {/* Description */}
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed">
          We&apos;re working hard to bring you an amazing demo experience. Stay tuned for exciting features and updates!
        </p>

        {/* Features Preview */}
        <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
          <div className="bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">🎥</div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Video Demo</div>
          </div>
          <div className="bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">🚀</div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">Live Preview</div>
          </div>
          <div className="bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl p-4">
            <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-1">✨</div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">New Features</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            asChild
            size="lg"
            className="relative overflow-hidden bg-linear-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white group"
          >
            <a href="mailto:contact@tellmemore.com" className="flex items-center gap-2">
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-linear-to-br from-transparent via-white/20 to-transparent" />
              <Mail className="w-5 h-5" />
              <span className="relative z-10">Get Notified</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-zinc-200 dark:border-zinc-800"
          >
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Timeline */}
        <div className="text-sm text-zinc-500 dark:text-zinc-500">
          Expected Launch: <span className="font-semibold text-purple-600 dark:text-purple-400">Q1 2026</span>
        </div>
      </div>
    </div>
  );
}
