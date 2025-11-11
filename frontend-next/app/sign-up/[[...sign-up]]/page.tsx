// /src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-linear-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md">
        <SignUp 
          fallbackRedirectUrl="/dashboard"
          signInFallbackRedirectUrl="/dashboard"
          forceRedirectUrl="/dashboard"
          signInForceRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}