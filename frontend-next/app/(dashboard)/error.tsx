"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("❌ Dashboard Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Dashboard Error</h1>
          <p className="text-sm text-muted-foreground">
            Something went wrong while loading your dashboard.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="mb-2 text-sm font-medium">Error Details:</p>
            <p className="text-sm text-muted-foreground font-mono wrap-break-word">
              {error.message || "An unknown dashboard error occurred"}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="mb-2 font-medium">Quick fixes:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Try refreshing the page</li>
              <li>Start a new chat session</li>
              <li>Clear your browser cache</li>
              <li>Check if you&apos;re still logged in</li>
            </ul>
          </div>

          {/* Additional dashboard-specific info */}
          <div className="rounded-lg border border-muted bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Your chat sessions and data are safe. This
              is just a temporary display issue.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button onClick={reset} className="flex-1" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button asChild className="flex-1" variant="outline">
            <Link href="/dashboard">
              <MessageSquare className="mr-2 h-4 w-4" />
              New Session
            </Link>
          </Button>
          <Button asChild variant="ghost" className="flex-1">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
