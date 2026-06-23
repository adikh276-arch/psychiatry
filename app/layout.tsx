import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { AuthGuard } from "@/components/shared/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Psychiatry Self-Care | MantraCare",
  description: "Tools and guidance for managing your psychiatric health — understanding your diagnosis, medication, clinical monitoring, and building stability.",
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
      <body className="min-h-full flex flex-col">
        {/* Ponytail: Single suspense boundary wraps auth guard -> wraps content. Clean and minimal. */}
        <Suspense fallback={<div className="min-h-screen bg-[#fafcff] flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div></div>}>
          <AuthGuard>
            {children}
          </AuthGuard>
        </Suspense>
      </body>
    </html>
  );
}

export const viewport = { colorScheme: "light" };
