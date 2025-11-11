import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 bg-transparent backdrop-blur-xs">
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-3">
        <Image src="/favicon.ico" alt="TellMeMore Logo" width={32} height={32} className="drop-shadow dark:brightness-110" />
        <span className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">TellMeMore</span>
      </div>
      {/* Center: Page Items */}
      <div className="flex-1 flex justify-center gap-8">
        <a href="#features" className="text-zinc-700 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white text-base font-medium transition">Features</a>
        <a href="#how" className="text-zinc-700 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white text-base font-medium transition">How It Works</a>
        <a href="#pricing" className="text-zinc-700 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white text-base font-medium transition">Pricing</a>
        <a href="#about" className="text-zinc-700 hover:text-zinc-900 dark:text-white/80 dark:hover:text-white text-base font-medium transition">About</a>
      </div>
      {/* Right: Auth Buttons */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link href="/sign-in" className="px-4 py-2 rounded-lg font-medium text-zinc-700 bg-transparent hover:bg-zinc-200 dark:text-white dark:bg-transparent dark:hover:bg-white/10 transition">Login</Link>
        <Link href="/sign-up" className="px-4 py-2 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 dark:text-blue-400 dark:bg-white/90 dark:hover:bg-blue-600 dark:hover:text-white transition">Sign Up</Link>
      </div>
    </nav>
  );
}
