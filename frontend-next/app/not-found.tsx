import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you&#39;re looking for doesn&#39;t exist or has been moved. Let&#39;s get you back on track.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
