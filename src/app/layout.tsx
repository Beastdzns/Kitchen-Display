import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import LayoutContent from "@/components/LayoutContent";

export const metadata: Metadata = {
  title: "Company A | Authentic Hyderabadi Biryani & Direct Ordering",
  description:
    "Direct online ordering for Company A. 14 outlets and 3 cloud kitchens in Hyderabad. Save 25% delivery app commissions, earn loyalty cashback, and enjoy real-time kitchen tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0f1115] text-gray-100">
        <AppProvider>
          <LayoutContent>{children}</LayoutContent>
        </AppProvider>
      </body>
    </html>
  );
}
