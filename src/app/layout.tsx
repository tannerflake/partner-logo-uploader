import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppToaster } from "@/components/AppToaster";
import { FloatingFloraBackground } from "@/components/FloatingFloraBackground";
import { SiteLogo } from "@/components/SiteLogo";
import { APP_NAME } from "@/lib/app-name";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Upload partner SVG logos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="relative min-h-full flex flex-col">
        <FloatingFloraBackground />
        <div className="relative z-10 flex min-h-full flex-1 flex-col">
          <SiteLogo />
          <AppToaster />
          {children}
        </div>
      </body>
    </html>
  );
}
