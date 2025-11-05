"use client";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AppSessionSidebar } from "@/components/sessions/AppSessionSidebar";
import { AppRightSidebar } from "@/components/sidebar/AppRightSidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useCreateSession } from "@/lib/hooks/useSessions";
import { useRouter } from "next/navigation";

/**
 * Dashboard Home Page
 * 
 * Shows a welcome message and prompts user to create or select a session.
 * Actual chat happens at /dashboard/[sessionId]
 */
export default function DashboardPage() {
  const createSession = useCreateSession();
  const router = useRouter();

  const handleCreateSession = async () => {
    try {
      const newSession = await createSession.mutateAsync({
        title: `Chat ${new Date().toLocaleString()}`,
      });
      router.push(`/dashboard/${newSession.session_id}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  return (
    <>
      <AppSessionSidebar />
      <SidebarInset className="flex flex-col flex-1">
        <DashboardHeader />
        <div className="flex-1 flex items-center justify-center bg-linear-to-br from-background via-background to-accent/5">
          <div className="text-center space-y-6 max-w-2xl px-4">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight">
                Welcome to TellMeMore
              </h1>
              <p className="text-xl text-muted-foreground">
                Compare AI models side-by-side in real-time
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Select a session from the sidebar or create a new one to start chatting
              </p>
              
              <Button
                size="lg"
                onClick={handleCreateSession}
                disabled={createSession.isPending}
                className="gap-2"
              >
                <MessageSquarePlus className="h-5 w-5" />
                {createSession.isPending ? "Creating..." : "Start New Chat"}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Dual Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Compare responses from two AI models simultaneously
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Multiple Providers</h3>
                <p className="text-sm text-muted-foreground">
                  Choose from OpenAI, Google Gemini, and Groq models
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card">
                <h3 className="font-semibold mb-2">Session History</h3>
                <p className="text-sm text-muted-foreground">
                  All your conversations are saved and organized
                </p>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
      <AppRightSidebar />
    </>
  );
}

