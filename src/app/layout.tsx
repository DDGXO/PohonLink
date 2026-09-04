import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConsoleBranding } from "@/components/branding";
import PwaRegister from "@/components/pwa-register";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const viewport: Viewport = {
  themeColor: "#4ade80",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://pohonlink.dgxohq.com"),
  title: {
    default: "Pohonlink - Bio Link & Digital Store Platform",
    template: "%s | Pohonlink",
  },
  description: "Platform biolink dan toko digital modern serba satu tautan untuk kreator, bisnis, dan profesional di Indonesia.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pohonlink",
  },
  applicationName: "Pohonlink",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Pohonlink - Bio Link & Digital Store Platform",
    description: "Platform biolink dan toko digital modern serba satu tautan untuk kreator, bisnis, dan profesional.",
    url: "https://pohonlink.dgxohq.com",
    siteName: "Pohonlink",
    images: [{ url: "/screenshots/desktop.png", width: 1280, height: 720, alt: "Pohonlink Preview" }],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${dmSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ConsoleBranding />
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
