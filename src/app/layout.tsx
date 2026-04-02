import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import { Jua } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/mode-toggle/theme-provider"
import React from "react";
import { Toaster } from "@/components/ui/sonner"

const jua = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-jua",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bath Pass",
  description: "Student tracking application for teachers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
        <body
            className={`${jua.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
        </body>
    </html>
  );
}

