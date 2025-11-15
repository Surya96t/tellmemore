"use client";

import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FadeIn } from "@/components/ui/fade-in";
import { useState } from "react";

// Import highlight.js theme
import "highlight.js/styles/github-dark.css";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model?: string;
  isLoading?: boolean;
  error?: string;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  model,
  isLoading,
  error,
}: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <FadeIn
      className={cn(
        "flex w-full gap-3 px-2 py-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
        )}
      >
        {/* Header: Model badge + timestamp */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {!isUser && model && (
            <Badge variant="outline" className="text-xs">
              {model}
            </Badge>
          )}
          <span>{new Date(timestamp).toLocaleTimeString()}</span>
        </div>

        {/* Message bubble */}
        <div
          className={cn(
            "rounded-lg px-4 py-3",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            error && "border-2 border-destructive"
          )}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-current" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-current delay-75" />
              <div className="h-2 w-2 animate-pulse rounded-full bg-current delay-150" />
            </div>
          ) : error ? (
            <div className="text-sm text-destructive">
              <p className="font-semibold">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : isUser ? (
            // User message: plain text
            <div className="whitespace-pre-wrap text-sm">{content}</div>
          ) : (
            // Assistant message: Markdown with code highlighting
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-7 prose-p:mb-4 prose-headings:font-semibold prose-headings:mb-3 prose-headings:mt-6 prose-ul:my-3 prose-ol:my-3 prose-li:my-1 prose-code:text-sm prose-pre:my-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    return !isInline ? (
                      <CodeBlock
                        language={match?.[1] || "text"}
                        code={String(children).replace(/\n$/, "")}
                      />
                    ) : (
                      <code
                        className="rounded bg-muted px-1 py-0.5 text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  p: ({ children }) => (
                    <p className="mb-4 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-3 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-3 space-y-1">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed">{children}</li>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

// Code block with copy button
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative">
      <div className="flex items-center justify-between rounded-t-lg bg-muted px-4 py-2">
        <span className="text-xs text-muted-foreground">{language}</span>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 px-2"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      <pre className="mt-0! overflow-x-auto rounded-b-lg rounded-t-none!">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}
