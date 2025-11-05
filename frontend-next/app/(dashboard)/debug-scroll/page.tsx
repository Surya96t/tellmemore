import { AppSessionSidebar } from "@/components/sessions/AppSessionSidebar";
import { AppRightSidebar } from "@/components/sidebar/AppRightSidebar";
import { SidebarInset } from "@/components/ui/sidebar";

export default function DebugScrollPage() {
  return (
    <>
      <AppSessionSidebar />
      <SidebarInset className="flex flex-col min-h-0 overflow-hidden bg-red-100">
        <div className="shrink-0 bg-yellow-300 p-4 text-sm font-bold">
          HEADER (should be fixed at top)
        </div>
        
        <div className="flex flex-1 flex-col overflow-hidden bg-green-100">
          <p className="p-2 text-xs bg-blue-200">Wrapper: flex flex-1 flex-col overflow-hidden</p>
          
          <div className="grid flex-1 grid-cols-2 gap-4 p-4 min-h-0 bg-purple-100">
            <p className="absolute top-20 left-1/2 z-50 text-xs bg-orange-200 p-2">Grid: flex-1 min-h-0 (NO overflow-hidden)</p>
            
            {/* Left Card */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card rounded-3xl border shadow-sm">
              <div className="shrink-0 border-b p-2 bg-slate-200">
                Left Card Header (shrink-0)
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-white">
                <p className="text-xs bg-yellow-100 p-1 mb-2">Scrollable area: flex-1 overflow-y-auto</p>
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="mb-2 rounded border bg-slate-50 p-2 text-sm">
                    Message {i + 1}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Card */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card rounded-3xl border shadow-sm">
              <div className="shrink-0 border-b p-2 bg-slate-200">
                Right Card Header (shrink-0)
              </div>
              <div className="flex-1 overflow-y-auto p-2 bg-white">
                <p className="text-xs bg-yellow-100 p-1 mb-2">Scrollable area: flex-1 overflow-y-auto</p>
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="mb-2 rounded border bg-slate-50 p-2 text-sm">
                    Message {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="shrink-0 border-t bg-white p-4">
            <div className="rounded-lg border bg-slate-100 p-3 text-sm font-bold">
              INPUT (should be fixed at bottom, shrink-0)
            </div>
          </div>
        </div>
      </SidebarInset>
      <AppRightSidebar />
    </>
  );
}
