import "./globals.css";
import { ReactNode } from "react";
import LayoutWrapper from "./components/LayoutWrapper";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Top */}
        <LayoutWrapper position="top" />

        {/* Page content grows */}
        <main className="flex-1">
          {children}
        </main>

        {/* Bottom */}
        <LayoutWrapper position="bottom" />
      </body>
    </html>
  );
}
