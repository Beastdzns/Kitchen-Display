"use client";

import React from "react";
import { usePathname } from "next/navigation";
import DemoBar from "./DemoBar";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isKDS = pathname.startsWith("/kds");

  return (
    <div className="min-h-screen flex flex-col bg-[#0f1115] text-gray-100">
      {/* Universal Demo Switcher Bar on top for Reviewer */}
      <DemoBar />

      {/* Render Customer Navbar & Footer only on customer/admin pages, let KDS have 100% tablet height */}
      {!isKDS && <Navbar />}

      <div className="flex-1 flex flex-col">{children}</div>

      {!isKDS && <Footer />}
    </div>
  );
}

