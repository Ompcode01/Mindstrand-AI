import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { DemoPanel } from "@/components/shared/demo-panel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MindShield AI — Behavioral Health Intelligence Platform",
  description:
    "AI-powered early detection and intervention for Internet Gaming Disorder and Body Dysmorphic Disorder. Real-time behavioral analytics for your mental wellbeing.",
  keywords: ["mental health", "IGD", "BDD", "behavioral health", "AI", "wellness"],
  openGraph: {
    title: "MindShield AI",
    description: "AI-Powered Behavioral Health Intelligence Platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          {children}
          <DemoPanel />
        </Providers>
      </body>
    </html>
  );
}
