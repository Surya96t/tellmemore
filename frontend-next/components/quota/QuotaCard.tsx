"use client";

import { useQuota } from "@/lib/hooks";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuotaCard() {
  const { data: quota, isLoading, error } = useQuota();

  const percentUsed = quota
    ? (quota.used_today / quota.daily_limit) * 100
    : 0;

  const quotaRemaining = quota
    ? quota.daily_limit - quota.used_today
    : 0;

  // Determine quota status color and icon
  const getQuotaStatus = () => {
    if (percentUsed >= 100) {
      return {
        color: "text-destructive",
        bgColor: "bg-destructive/10",
        icon: AlertCircle,
        message: "Quota exceeded - resets in 24 hours",
      };
    } else if (percentUsed >= 80) {
      return {
        color: "text-yellow-600",
        bgColor: "bg-yellow-600/10",
        icon: AlertTriangle,
        message: "Approaching quota limit",
      };
    } else {
      return {
        color: "text-green-600",
        bgColor: "bg-green-600/10",
        icon: CheckCircle2,
        message: "Quota healthy",
      };
    }
  };

  const status = getQuotaStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <StatusIcon className={cn("h-4 w-4", status.color)} />
            Daily Quota
          </span>
          <span className={cn("text-xs font-normal", status.color)}>
            {Math.round(percentUsed)}%
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : error ? (
          <p className="text-sm text-muted-foreground">
            Failed to load quota
          </p>
        ) : (
          <>
            {/* Quota usage */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Used:</span>
              <span className="font-medium">
                {quota?.used_today.toLocaleString()} / {quota?.daily_limit.toLocaleString()}
              </span>
            </div>

            {/* Progress bar with color */}
            <div className="space-y-1">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-primary/20">
                <div
                  className={cn(
                    "h-full transition-all",
                    percentUsed >= 100
                      ? "bg-destructive"
                      : percentUsed >= 80
                      ? "bg-yellow-600"
                      : "bg-green-600"
                  )}
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {quotaRemaining.toLocaleString()} tokens remaining
              </p>
            </div>

            {/* Only show status message for warning/error states */}
            {percentUsed >= 80 && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs",
                  percentUsed >= 100
                    ? "border-destructive/50 bg-destructive/5 text-destructive"
                    : "border-yellow-600/50 bg-yellow-600/5 text-yellow-600"
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                <span>{status.message}</span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
