"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./footer";
import ChatBot from "./chatbot";

export default function NavbarWrapper({
  children,
}: {
  children: React.ReactNode;
  }): React.ReactElement | null {
  const pathname = usePathname();

  const hideLayout =
    pathname === "/auth/login" ||
    pathname === "/auth/signuppage";

  if (hideLayout) return <>{children}</>;

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main>{children}</main>

      {/* Floating ChatBot */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <ChatBot />
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}