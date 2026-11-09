"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Award,
  Users,
  Sparkles,
  Utensils,
  Tablet,
} from "lucide-react";
import { HYDERABAD_OUTLETS } from "@/lib/constants";

export default function Navbar() {
  const pathname = usePathname();
  const { selectedOutlet, setSelectedOutlet, cartCount, cartTotal, currentUser } = useApp();
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="bg-[#120a17]/95 border-b border-amber-500/30 sticky top-0 z-40 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-2 gap-4">
          {/* Brand Logo with Festive Diya & Heritage Title */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 rounded-2xl bg-[#120a17] flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform duration-300 border border-amber-300/40 relative overflow-hidden">
                <img
                  src="/assets/logo-royal-diya.webp"
                  alt="Royal Diya"
                  className="w-full h-full object-cover"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold tracking-wide text-white group-hover:text-amber-300 transition-colors leading-none">
                    COMPANY A
                  </span>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 border border-amber-500/40 font-mono">
                    Diwali Dawat
                  </span>
                </div>
                <div className="text-[10px] text-amber-400/90 font-medium tracking-widest uppercase mt-0.5">
                  Hyderabad Royal Biryani & Sweets
                </div>
              </div>
            </Link>

            {/* Outlet Selector Dropdown Pill with Clear Tactile Border */}
            <div className="relative">
              <button
                onClick={() => setShowOutletDropdown(!showOutletDropdown)}
                className="hidden sm:flex items-center gap-2 bg-[#20132b] hover:bg-[#2c1a3b] border-2 border-amber-500/40 hover:border-amber-400 px-3.5 py-1.5 rounded-xl text-xs transition-all shadow-md"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <div className="text-left">
                  <span className="font-bold text-gray-200 block leading-tight">{selectedOutlet.name}</span>
                  <span className="text-gray-400 text-[10px] font-mono leading-none">
                    {selectedOutlet.deliveryRadiusKm} km coverage
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
              </button>

              {showOutletDropdown && (
                <div className="absolute left-0 mt-2 w-80 bg-[#1c1126] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-2 z-50 animate-role-switch-in">
                  <div className="px-3 py-2 text-xs font-bold text-amber-400 uppercase tracking-wider border-b border-gray-800 flex items-center justify-between">
                    <span>Delivering Station / Cloud Kitchen</span>
                    <span className="text-[10px] font-mono text-gray-400">17 Hubs</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                    {HYDERABAD_OUTLETS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOutlet(o);
                          setShowOutletDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition border ${
                          selectedOutlet.id === o.id
                            ? "bg-amber-500/20 text-amber-300 font-bold border-amber-500/40"
                            : "hover:bg-[#2b193d] text-gray-300 border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{o.name}</span>
                          <span className="text-[10px] font-mono text-amber-400">
                            {o.type === "CLOUD_KITCHEN" ? "Cloud Kitchen" : "Dine-In"}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 mt-0.5 truncate">{o.address}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Links with Clear Boundaries & Active Indicators */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-bold">
            <Link
              href="/menu"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition border ${
                isActive("/menu")
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                  : "text-gray-300 hover:text-white hover:bg-[#231530] border-transparent"
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Royal Menu</span>
            </Link>

            <Link
              href="/catering"
              className={`hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition border ${
                isActive("/catering") && !pathname.includes("/desk")
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                  : "bg-gradient-to-r from-red-950/40 to-amber-950/40 text-amber-300 hover:text-amber-200 border-amber-500/30 hover:border-amber-500"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span>Diwali Bulk Dawat</span>
            </Link>

            <Link
              href="/kds"
              className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl transition border ${
                isActive("/kds")
                  ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-200 hover:bg-[#231530] border-transparent"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Kitchen Screen</span>
            </Link>

            {/* Cart Pill with Festive Glow & Distinct Count */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black px-4 py-2 rounded-xl font-extrabold shadow-lg shadow-amber-500/30 transition-transform active:scale-95 border border-amber-300/50 ml-1"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-amber-300 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center font-mono border border-amber-400">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-mono font-extrabold">
                {cartCount > 0 ? `₹${cartTotal}` : "Cart"}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
