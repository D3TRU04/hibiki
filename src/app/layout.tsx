import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DynamicContextProvider, DynamicWagmiConnector, DYNAMIC_CONFIG } from "@/lib/dynamic-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kleo - Share Your Stories",
  description: "Share your stories and memories on an interactive 3D globe",
  keywords: ["stories", "map", "globe", "memories", "interactive"],
  authors: [{ name: "Kleo Team" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DynamicContextProvider {...DYNAMIC_CONFIG}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </DynamicContextProvider>
      </body>
    </html>
  );
}
