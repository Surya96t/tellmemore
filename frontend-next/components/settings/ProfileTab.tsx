"use client";

import { UserProfile } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileTab() {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>
            Manage your profile information, email, and security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-hidden">
          <UserProfile
            routing="path"
            path="/settings"
            appearance={{
              baseTheme: resolvedTheme === "dark" ? undefined : undefined,
              elements: {
                rootBox: "w-full max-w-full",
                card: "w-full max-w-full shadow-none border-0 bg-transparent",
                navbar: "bg-transparent border-r border-border",
                navbarButton: "text-foreground hover:bg-accent hover:text-accent-foreground",
                navbarButtonActive: "text-primary bg-accent",
                pageScrollBox: "bg-transparent w-full max-w-full",
                page: "bg-transparent w-full max-w-full",
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                formFieldInput: "bg-background border-input text-foreground",
                formFieldLabel: "text-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/90",
                profileSectionTitle: "text-foreground",
                profileSectionContent: "text-muted-foreground",
                profileSectionPrimaryButton: "text-primary hover:text-primary/90",
                accordionTriggerButton: "text-foreground hover:text-accent-foreground",
                badge: "bg-primary/10 text-primary",
                breadcrumbsItem: "text-muted-foreground",
                breadcrumbsItemDivider: "text-muted-foreground",
                modalContent: "bg-card border-border",
                modalCloseButton: "text-muted-foreground hover:text-foreground",
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
