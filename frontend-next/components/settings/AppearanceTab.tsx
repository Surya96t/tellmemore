"use client";

import { useTheme } from "next-themes";
import { useUiStore } from "@/lib/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const { fontSize, setFontSize } = useUiStore();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch - mount client-only
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Theme Settings */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>
            Choose how TellMeMore looks to you. Select a single theme, or sync with your system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 hover:border-primary transition-colors ${
                theme === "light" ? "border-primary" : "border-muted"
              }`}
            >
              <Sun className="h-8 w-8" />
              <span className="text-sm font-medium">Light</span>
            </button>

            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 hover:border-primary transition-colors ${
                theme === "dark" ? "border-primary" : "border-muted"
              }`}
            >
              <Moon className="h-8 w-8" />
              <span className="text-sm font-medium">Dark</span>
            </button>

            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 hover:border-primary transition-colors ${
                theme === "system" ? "border-primary" : "border-muted"
              }`}
            >
              <Monitor className="h-8 w-8" />
              <span className="text-sm font-medium">System</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Font Size Settings */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Font Size</CardTitle>
          <CardDescription>
            Adjust the font size for chat messages and UI text.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="font-size-slider">Font Size</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              id="font-size-slider"
              min={12}
              max={20}
              step={1}
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small (12px)</span>
              <span>Default (14px)</span>
              <span>Large (20px)</span>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg border p-4" style={{ fontSize: `${fontSize}px` }}>
            <p className="font-medium mb-2">Preview Text</p>
            <p className="text-muted-foreground">
              This is how your chat messages will look with the selected font size. 
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
