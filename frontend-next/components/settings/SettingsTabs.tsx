"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { AppearanceTab } from "./AppearanceTab";
import { ModelsTab } from "./ModelsTab";
import { NotificationsTab } from "./NotificationsTab";
import { DataTab } from "./DataTab";

export function SettingsTabs() {
  return (
    <Tabs defaultValue="profile" className="space-y-4 sm:space-y-6">
      <TabsList className="grid grid-cols-5 w-full h-auto flex-wrap sm:flex-nowrap gap-1 sm:gap-0 p-1">
        <TabsTrigger value="profile" className="text-xs sm:text-sm px-2 sm:px-4">
          Profile
        </TabsTrigger>
        <TabsTrigger value="appearance" className="text-xs sm:text-sm px-2 sm:px-4">
          Appearance
        </TabsTrigger>
        <TabsTrigger value="models" className="text-xs sm:text-sm px-2 sm:px-4">
          Models
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs sm:text-sm px-2 sm:px-4">
          Notifications
        </TabsTrigger>
        <TabsTrigger value="data" className="text-xs sm:text-sm px-2 sm:px-4">
          Data
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="w-full">
        <ProfileTab />
      </TabsContent>

      <TabsContent value="appearance" className="space-y-4">
        <AppearanceTab />
      </TabsContent>

      <TabsContent value="models" className="space-y-4">
        <ModelsTab />
      </TabsContent>

      <TabsContent value="notifications" className="space-y-4">
        <NotificationsTab />
      </TabsContent>

      <TabsContent value="data" className="space-y-4">
        <DataTab />
      </TabsContent>
    </Tabs>
  );
}
