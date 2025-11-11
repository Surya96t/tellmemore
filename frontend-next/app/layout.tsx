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
          colorPrimary: "#0ea5e9", // Sky blue
          colorBackground: "#18181b", // Lighter dark background
          colorInputBackground: "#27272a", // Lighter input background
          colorInputText: "#ffffff", // White text
          colorText: "#ffffff", // White text
          colorTextSecondary: "#a1a1aa", // Gray text
          colorDanger: "#ef4444", // Red
          colorSuccess: "#10b981", // Green
          colorWarning: "#f59e0b", // Orange
          colorNeutral: "#71717a", // Lighter gray
          fontFamily: "var(--font-geist-sans)",
          borderRadius: "0.75rem",
        },
        elements: {
          // Root and card styling
          rootBox: "w-full",
          card: "bg-[#18181b] text-white border-[3px] border-[#52525b] shadow-2xl rounded-xl",
          
          // Header styling
          headerTitle: "text-white text-2xl font-bold",
          headerSubtitle: "text-[#d4d4d8] text-sm",
          
          // Social buttons
          socialButtonsBlockButton: "bg-[#27272a] border-[2px] border-[#71717a] hover:bg-[#3f3f46] hover:border-[#0ea5e9] transition-all text-white font-medium",
          socialButtonsBlockButtonText: "text-white font-medium",
          
          // Dividers
          dividerLine: "bg-[#71717a]",
          dividerText: "text-[#d4d4d8]",
          
          // Form fields
          formFieldLabel: "text-white font-medium text-sm mb-2",
          formFieldInput: "bg-[#27272a] border-[2px] border-[#71717a] focus:border-[#0ea5e9] text-white rounded-lg transition-all shadow-sm placeholder:text-[#a1a1aa]",
          formFieldInputShowPasswordButton: "text-[#d4d4d8] hover:text-white",
          
          // Buttons
          formButtonPrimary: "bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold shadow-lg hover:shadow-xl transition-all",
          
          // Links and misc
          footerActionLink: "text-[#0ea5e9] hover:text-[#38bdf8] font-medium underline-offset-4",
          identityPreviewText: "text-white",
          identityPreviewEditButton: "text-[#0ea5e9] hover:text-[#38bdf8]",
          
          // OTP/Code inputs
          otpCodeFieldInput: "border-[2px] border-[#71717a] text-white bg-[#27272a]",
          formResendCodeLink: "text-[#0ea5e9] hover:text-[#38bdf8]",
          
          // User button popover
          userButtonPopoverCard: "bg-[#27272a] text-white border-[2px] border-[#71717a] shadow-md",
          userButtonPopoverActionButton: "hover:bg-[#3f3f46] hover:text-white",
          userButtonPopoverActionButtonText: "text-white",
          userButtonPopoverActionButtonIcon: "text-[#d4d4d8]",
          userButtonPopoverFooter: "border-t border-[#71717a]",
        },
      }}
    >
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
