import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/providers/theme-provider";

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
  interactiveWidget: "resizes-visual",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#0A0A0A" },
    { media: "(prefers-color-scheme: light)", color: "#F2F1ED" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Apply saved theme before first paint to avoid flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('rp-theme')||'dark';document.documentElement.className=t;}catch(e){}`,
          }}
        />
        {/* Preconnect to CDNs so the first video/image request doesn't wait for DNS + TLS */}
        <link rel="preconnect" href="https://utfs.io" />
        <link rel="preconnect" href="https://uploadthing.com" />
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
        <ThemeProvider>
          <SessionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
