import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { AppSessionSidebar } from "@/components/sessions/AppSessionSidebar";
import { DualChatView } from "@/components/chat/DualChatView";
import { SidebarInset } from "@/components/ui/sidebar";

interface DashboardPageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Next.js 16: searchParams is async
  const { session } = await searchParams;
  const currentSessionId = session || null;

  return (
    <>
      {/* Left sidebar */}
      <AppSessionSidebar />
      
      {/* Main content area */}
      {/* CRITICAL: SidebarInset needs min-h-0 overflow-hidden for flexbox scrolling */}
      <SidebarInset className="flex flex-col min-h-0 overflow-hidden">
        {/* Header with search, breadcrumb, and controls - fixed at top */}
        <DashboardHeader sessionId={currentSessionId || undefined} />
        
        {/* Chat view - takes remaining space, scrolls internally */}
        {/* CRITICAL: Remove flex-1 wrapper, let DualChatView handle its own flex */}
        <DualChatView sessionId={currentSessionId} />
      </SidebarInset>
    </>
  );
}
