import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

// ✅ Import Figtree from next/font/google
import { Figtree } from "next/font/google";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  title: "Greenscore AI",
  description: "Calculate the GreenScore of your land.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={figtree.variable}>
      <body className={cn("font-body antialiased min-h-screen bg-background")}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
