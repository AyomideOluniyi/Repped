import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: {
    default: "REPPED: Your Fitness Companion",
    template: "%s | REPPED",
  },
  description:
    "Track workouts, analyze meals with AI, find gym buddies, and level up your training. The all-in-one fitness PWA.",
  keywords: ["fitness", "workout tracker", "gym", "nutrition", "AI fitness"],
  authors: [{ name: "REPPED" }],
  creator: "REPPED",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "REPPED",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "REPPED: Your Fitness Companion",
    description: "Track workouts, analyze meals with AI, find gym buddies, and level up your training.",
    siteName: "REPPED",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "REPPED: Your Fitness Companion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "REPPED: Your Fitness Companion",
    description: "Track workouts, analyze meals with AI, find gym buddies, and level up your training.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@700,800,900&f[]=dm-sans@400,500,600&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="REPPED" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-startup-image" href="/icons/splash-screen.png" />
      </head>
      <body className="bg-background text-text-primary font-body antialiased">
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
