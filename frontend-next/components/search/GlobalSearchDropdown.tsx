"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSessions } from "@/lib/hooks/useSessions";
import { MessageSquare, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SearchResult {
  type: "session" | "message";
  id: string;
  title: string;
  preview?: string;
  sessionId: string;
  sessionTitle: string;
}

interface GlobalSearchDropdownProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchDropdown({
  query,
  isOpen,
  onClose,
}: GlobalSearchDropdownProps) {
  const router = useRouter();
  const { data: sessions, isLoading } = useSessions();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Handler for selecting a result
  const handleSelectResult = useCallback((result: SearchResult) => {
    router.push(`/${result.sessionId}`);
    onClose();
  }, [router, onClose]);

  // Compute search results based on query
  const results = useMemo(() => {
    if (!query || query.length < 2) {
      return [];
    }

    const searchResults: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search in session titles
    sessions?.forEach((session) => {
      if (session.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          type: "session",
          id: session.session_id,
          title: session.title,
          sessionId: session.session_id,
          sessionTitle: session.title,
        });
      }
    });

    // TODO: Search in chat messages (requires fetching all prompts)
    // For now, we'll just search session titles
    // Future enhancement: Add message search

    return searchResults;
  }, [query, sessions]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen || results.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          handleSelectResult(results[selectedIndex]);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelectResult]);

  if (!isOpen || !query || query.length < 2) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg max-h-[400px] overflow-y-auto z-50">
      {isLoading ? (
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground text-center">
          No results found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="py-2">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => handleSelectResult(result)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-start gap-3",
                selectedIndex === index && "bg-accent"
              )}
            >
              <div className="mt-0.5">
                {result.type === "session" ? (
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <FileText className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {highlightMatch(result.title, query)}
                </div>
                {result.preview && (
                  <div className="text-xs text-muted-foreground truncate">
                    {highlightMatch(result.preview, query)}
                  </div>
                )}
                {result.type === "message" && (
                  <div className="text-xs text-muted-foreground mt-0.5">
                    in {result.sessionTitle}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          {results.length} {results.length === 1 ? "result" : "results"}
        </span>
        <div className="flex items-center gap-2">
          <span>↑↓ to navigate</span>
          <span>•</span>
          <span>Enter to open</span>
        </div>
      </div>
    </div>
  );
}

// Helper function to highlight matching text
function highlightMatch(text: string, query: string) {
  const parts = text.split(new RegExp(`(${query})`, "gi"));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-900/50">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}
