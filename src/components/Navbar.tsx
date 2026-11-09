"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  ShoppingBag,
  MapPin,
  ChevronDown,
  ShieldCheck,
  Award,
  Users,
} from "lucide-react";
import { HYDERABAD_OUTLETS } from "@/lib/constants";

export default function Navbar() {
  const { selectedOutlet, setSelectedOutlet, cartCount, cartTotal, currentUser } = useApp();
  const [showOutletDropdown, setShowOutletDropdown] = useState(false);

  return (
    <nav className="bg-[#14161e] border-b border-gray-800 sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-serif text-lg font-bold tracking-wide text-white group-hover:text-amber-400 transition leading-none">
                  COMPANY A
                </div>
                <div className="text-[10px] text-amber-500 font-medium tracking-widest uppercase mt-0.5">
                  Hyderabad Royal Biryani
                </div>
              </div>
            </Link>

            {/* Outlet Selector Dropdown Pill */}
            <div className="relative">
              <button
                onClick={() => setShowOutletDropdown(!showOutletDropdown)}
                className="hidden sm:flex items-center gap-2 bg-[#1e222d] hover:bg-[#262c3a] border border-gray-700/80 px-3.5 py-1.5 rounded-full text-xs transition"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold text-gray-200">{selectedOutlet.name}</span>
                <span className="text-gray-400 text-[11px]">({selectedOutlet.deliveryRadiusKm} km radius)</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {showOutletDropdown && (
                <div className="absolute left-0 mt-2 w-72 bg-[#1b1e28] border border-gray-700 rounded-2xl shadow-2xl p-2 z-50">
                  <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-800">
                    Select Delivering Outlet / Cloud Kitchen
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 space-y-1">
                    {HYDERABAD_OUTLETS.map((o) => (
                      <button
                        key={o.id}
                        onClick={() => {
                          setSelectedOutlet(o);
                          setShowOutletDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col transition ${
                          selectedOutlet.id === o.id
                            ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                            : "hover:bg-[#252936] text-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{o.name}</span>
                          <span className="text-[10px] font-mono text-gray-400">
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

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-4 text-xs font-semibold">
            <Link
              href="/menu"
              className="text-gray-300 hover:text-amber-400 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition"
            >
              Menu
            </Link>
            <Link
              href="/catering"
              className="hidden md:flex items-center gap-1.5 text-amber-300 hover:text-amber-200 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Party & Bulk Dawat</span>
            </Link>
            <Link
              href="/kds"
              className="hidden lg:flex items-center gap-1.5 text-gray-400 hover:text-gray-200 px-3 py-2 rounded-lg hover:bg-gray-800/50 transition"
            >
              <span>Kitchen Screen</span>
            </Link>

            {/* Cart Pill with Count & Total */}
            <Link
              href="/cart"
              className="flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black px-4 py-2 rounded-full font-bold shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-black text-amber-400 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center font-mono">
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

