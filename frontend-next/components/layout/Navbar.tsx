"use client";

import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/lib/stores/uiStore";
import { Maximize, Minimize } from "lucide-react";

export function Navbar() {
  const { isFullscreen, toggleFullscreen } = useUiStore();

  return (
    <nav className="flex items-center justify-between bg-white border-b px-6 py-4 shadow-sm">
      {/* Logo + Branding */}
      <div className="flex items-center gap-2">
        <Image
          src="/db_logo.jpg"
          alt="TellMeMore Logo"
          width={40}
          height={40}
          className="rounded"
        />
        <span className="text-2xl font-bold">TellMeMore</span>
      </div>

      {/* Right Side: Fullscreen Toggle + Clerk UserButton */}
      <div className="flex items-center gap-4">
        {/* Fullscreen Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Full Screen" : "Enter Full Screen"}
        >
          {isFullscreen ? (
            <Minimize className="h-5 w-5" />
          ) : (
            <Maximize className="h-5 w-5" />
          )}
        </Button>

        {/* Clerk UserButton (Profile, Settings, Logout) */}
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}
