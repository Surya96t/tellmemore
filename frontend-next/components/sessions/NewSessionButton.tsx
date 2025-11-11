"use client";

import { Button } from "@/components/ui/button";
import { useCreateSession } from "@/lib/hooks";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function NewSessionButton() {
  const router = useRouter();
  const { mutate: createSession, isPending } = useCreateSession();

  const handleCreateSession = () => {
    const title = `Session-${Date.now()}`;

    createSession(
      { title },
      {
        onSuccess: (session) => {
          toast.success("Session created", {
            description: `New session "${session.title}" created successfully.`,
          });
          // Navigate to the new session
          router.push(`/dashboard?session=${session.session_id}`);
        },
        onError: () => {
          toast.error("Error", {
            description: "Failed to create session. Please try again.",
          });
        },
      }
    );
  };

  return (
    <Button
      onClick={handleCreateSession}
      disabled={isPending}
      className="w-full justify-center gap-2 font-semibold"
    >
      <PlusCircle className="h-5 w-5" />
      {isPending ? "Creating..." : "New Session"}
    </Button>
  );
}
