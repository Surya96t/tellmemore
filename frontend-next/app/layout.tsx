import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/providers/query-provider";
import { NetworkStatusProvider } from "@/lib/providers/network-status-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TellMeMore - AI Chat Interface for Multiple LLM Providers",
    template: "%s | TellMeMore",
  },
  description:
    "Chat with OpenAI GPT-4, Google Gemini, and Groq LLaMA models side-by-side. Compare AI responses, manage sessions, and track your daily quota.",
  keywords: [
    "AI chat",
    "LLM",
    "GPT-4",
    "Gemini",
    "LLaMA",
    "OpenAI",
    "Google AI",
    "Groq",
    "dual chat",
    "AI comparison",
  ],
  authors: [{ name: "TellMeMore Team" }],
  creator: "TellMeMore",
  publisher: "TellMeMore",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://tellmemore.app"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "TellMeMore - AI Chat Interface for Multiple LLM Providers",
    description:
      "Chat with OpenAI GPT-4, Google Gemini, and Groq LLaMA models side-by-side. Compare AI responses in real-time.",
    siteName: "TellMeMore",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TellMeMore AI Chat Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TellMeMore - AI Chat Interface",
    description:
      "Chat with multiple AI models side-by-side. Compare GPT-4, Gemini, and LLaMA responses.",
    images: ["/og-image.png"],
    creator: "@tellmemore",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined, // Let ThemeProvider control the theme
        variables: {
          colorPrimary: "hsl(var(--primary))",
          colorBackground: "hsl(var(--background))",
          colorInputBackground: "hsl(var(--input))",
          colorInputText: "hsl(var(--foreground))",
          colorText: "hsl(var(--foreground))",
          colorTextSecondary: "hsl(var(--muted-foreground))",
          colorDanger: "hsl(var(--destructive))",
          colorSuccess: "hsl(var(--primary))",
          colorWarning: "hsl(var(--warning))",
          colorNeutral: "hsl(var(--muted))",
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.5rem",
        },
        elements: {
          card: "bg-card text-card-foreground border border-border shadow-sm",
          headerTitle: "text-foreground font-semibold",
          headerSubtitle: "text-muted-foreground",
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
          formFieldInput: "bg-background border border-input text-foreground shadow-sm",
          footerActionLink: "text-primary hover:text-primary/90 underline-offset-4",
          identityPreviewText: "text-foreground",
          identityPreviewEditButton: "text-primary hover:text-primary/90",
          userButtonPopoverCard: "bg-popover text-popover-foreground border border-border shadow-md",
          userButtonPopoverActionButton: "hover:bg-accent hover:text-accent-foreground",
          userButtonPopoverActionButtonText: "text-foreground",
          userButtonPopoverActionButtonIcon: "text-muted-foreground",
          userButtonPopoverFooter: "border-t border-border",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen overflow-hidden`}
        >
          <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <QueryProvider>
                <NetworkStatusProvider>
                  {children}
                  <Analytics />
                  <Toaster />
                </NetworkStatusProvider>
              </QueryProvider>
            </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
