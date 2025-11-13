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
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
              attribute="class"
              defaultTheme="system"
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
