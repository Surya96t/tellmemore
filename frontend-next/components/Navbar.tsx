import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between py-6 px-8 bg-transparent backdrop-blur-xs">
      {/* Left: Logo and Name */}
      <div className="flex items-center gap-3">
        <Image src="/globe.svg" alt="TellMeMore Logo" width={36} height={36} className="drop-shadow" />
        <span className="text-xl font-bold text-white tracking-tight">TellMeMore</span>
      </div>
      {/* Center: Page Items */}
      <div className="flex-1 flex justify-center gap-8">
        <a href="#features" className="text-white/80 hover:text-white text-base font-medium transition">Features</a>
        <a href="#how" className="text-white/80 hover:text-white text-base font-medium transition">How It Works</a>
        <a href="#pricing" className="text-white/80 hover:text-white text-base font-medium transition">Pricing</a>
        <a href="#about" className="text-white/80 hover:text-white text-base font-medium transition">About</a>
      </div>
      {/* Right: Auth Buttons */}
      <div className="flex items-center gap-3">
        <a href="/sign-in" className="px-4 py-2 rounded-lg font-medium text-white bg-transparent hover:bg-white/10 transition">Login</a>
        <a href="/sign-up" className="px-4 py-2 rounded-lg font-medium text-blue-600 bg-white hover:bg-blue-600 hover:text-white transition">Sign Up</a>
      </div>
    </nav>
  );
}
