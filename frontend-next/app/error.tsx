"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("❌ Root Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-b from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Something went wrong!</h1>
          <p className="text-sm text-muted-foreground">
            We encountered an unexpected error. Don&apos;t worry, your data is safe.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm font-medium">Error Details:</p>
            <p className="text-sm text-muted-foreground font-mono wrap-break-word">
              {error.message || "An unknown error occurred"}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium">What you can do:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Try refreshing the page</li>
              <li>Clear your browser cache</li>
              <li>Check your internet connection</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} className="flex-1" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/")}
            className="flex-1"
            variant="outline"
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
