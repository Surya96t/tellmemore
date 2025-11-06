"use client";

import { useUiStore } from "@/lib/stores/uiStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function NotificationsTab() {
  const { enableNotifications, toggleNotifications } = useUiStore();

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Manage how and when you receive notifications from TellMeMore.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Browser Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="browser-notifications">Browser Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when chat responses are ready
              </p>
            </div>
            <Switch
              id="browser-notifications"
              checked={enableNotifications}
              onCheckedChange={toggleNotifications}
            />
          </div>

          {/* Future notification preferences can be added here */}
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Coming Soon</p>
            <p className="text-sm text-muted-foreground">
              Additional notification preferences (email alerts, quota warnings, etc.) will be available in a future update.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
