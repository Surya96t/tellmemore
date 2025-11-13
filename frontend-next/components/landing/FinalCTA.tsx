"use client";
import Link from "next/link";
import { useInView } from "@/hooks/useInView";

/**
 * FinalCTA Component
 * 
 * Final call-to-action section with glassmorphic design.
 * Encourages users to sign up with prominent CTA buttons.
 */

export default function FinalCTA() {
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className={`relative transition-all duration-1000 ${
          inView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
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
  );
}
