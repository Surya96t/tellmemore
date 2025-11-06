"use client";

import { useNetworkStatus } from "@/lib/hooks/useNetworkStatus";

/**
 * NetworkStatusProvider
 * 
 * Monitors network status and shows toast notifications
 * when connection is lost or restored.
 */
export function NetworkStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useNetworkStatus();

  return <>{children}</>;
}
