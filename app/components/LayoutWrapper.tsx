"use client";

import { usePathname, useRouter } from "next/navigation";
import { JSX, useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./footer";
import ChatBot from "./chatbot";
import { getUser } from "@/app/services/authService";

type LayoutWrapperProps = {
  position: "top" | "bottom";
};

export default function LayoutWrapper({
  position,
}: LayoutWrapperProps): React.ReactElement | null {
  const pathname = usePathname();
  const router = useRouter();

  const hideLayout = pathname.startsWith("/auth");

  useEffect(() => {
    // allow auth pages
    if (hideLayout) return;

    const user = getUser();

    if (!user) {
      router.replace("/auth/login"); // redirect if not logged in
    }
  }, [pathname, router]);

  if (hideLayout) return null;

  // TOP = Navbar
  if (position === "top") {
    return <Navbar />;
  }

  // BOTTOM = Footer + ChatBot
  return (
    <>
      <ChatBot />
      <Footer />
    </>
  );
}