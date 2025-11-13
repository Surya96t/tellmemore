// /src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from "@clerk/nextjs";
import BackgroundEffects from "@/components/landing/BackgroundEffects";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Effects - Full Page Parent */}
      <BackgroundEffects />
      
      {/* Two Column Layout Overlay */}
      <div className="relative z-10 min-h-screen w-full flex">
        {/* Left Column - Sign Up Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 backdrop-blur-3xl">
          <div className="w-full max-w-md">
            {/* Logo */}
            <Link href="/" className="mb-8 flex items-center gap-3 w-fit hover:opacity-80 transition-opacity">
              <Image src="/favicon.ico" alt="TellMeMore Logo" width={40} height={40} className="drop-shadow" />
              <span className="text-2xl font-bold text-zinc-900 dark:text-white">TellMeMore</span>
            </Link>

            {/* Sign Up Component */}
            <SignUp 
              fallbackRedirectUrl="/dashboard"
              signInFallbackRedirectUrl="/dashboard"
              forceRedirectUrl="/dashboard"
              signInForceRedirectUrl="/dashboard"
              appearance={{
                variables: {
                  colorBackground: "white",
                  colorShadow: "white",
                  borderRadius: "0.5rem",
                  colorNeutral: "#000000",
                  colorText: "#18181b",
                  colorTextSecondary: "#71717a",
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-transparent shadow-none border-0",
                  cardBox: "shadow-none border-0",
                  footer: "bg-white dark:bg-zinc-900",
                },
              }}
            />

            {/* Footer Text */}
            <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

        {/* Right Column - Marketing Content */}
        <div className="hidden lg:flex w-1/2 items-center justify-center p-12">
          <div className="max-w-lg text-center text-white">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-lg">
              Compare AI Models Side-by-Side
            </h2>
            <p className="text-lg text-white/90 mb-8 drop-shadow">
              Get better answers by comparing responses from GPT-4, Gemini, and LLaMA in real-time.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">9+</div>
                <div className="text-sm text-white/80">AI Models</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">100K</div>
                <div className="text-sm text-white/80">Token Limit</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-6 py-3">
                <div className="text-2xl font-bold">Fast</div>
                <div className="text-sm text-white/80">Responses</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}