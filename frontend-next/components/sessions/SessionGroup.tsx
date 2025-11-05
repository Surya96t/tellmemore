import { SessionItem } from "./SessionItem";
import type { ChatSession } from "@/lib/api/types";

interface SessionGroupProps {
  title: string;
  sessions: ChatSession[];
}

export function SessionGroup({ title, sessions }: SessionGroupProps) {
  if (sessions.length === 0) return null;

  return (
    <div className="mb-4">
      <h6 className="text-sm font-semibold text-muted-foreground mb-2">
        {title}
      </h6>
      <ul className="space-y-1">
        {sessions.map((session) => (
          <SessionItem key={session.session_id} session={session} />
        ))}
      </ul>
    </div>
  );
}
