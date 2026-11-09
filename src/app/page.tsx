"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { HYDERABAD_OUTLETS, HyderabadOutletSeed } from "@/lib/constants";
import { routeToNearestOutlet } from "@/lib/geo/router";
import {
  MapPin,
  Navigation,
  Flame,
  Clock,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  TrendingDown,
  Gift,
} from "lucide-react";

export default function HomePage() {
  const { selectedOutlet, setSelectedOutlet } = useApp();
  const [selectedLocality, setSelectedLocality] = useState<string>(selectedOutlet.locality);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string>(
    `Delivering from ${selectedOutlet.name} (${selectedOutlet.deliveryRadiusKm} km coverage)`
  );

  const handleSelectLocality = (outlet: HyderabadOutletSeed) => {
    setSelectedOutlet(outlet);
    setSelectedLocality(outlet.locality);
    setLocationMessage(`Delivering from ${outlet.name} • ${outlet.type === "CLOUD_KITCHEN" ? "Cloud Kitchen" : "Dine-In Hub"}`);
  };

  const handleGpsLocate = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const match = routeToNearestOutlet(pos.coords.latitude, pos.coords.longitude);
        if (match) {
          setSelectedOutlet(match.outlet);
          setSelectedLocality(match.outlet.locality);
          setLocationMessage(
            match.isDeliverable
              ? `GPS Located! Nearest: ${match.outlet.name} (${match.distanceKm} km away)`
              : `Nearest outlet is ${match.outlet.name} (${match.distanceKm} km away). Outside standard 6km delivery zone.`
          );
        }
      },
      (err) => {
        setLocating(false);
        setSelectedLocality("Kondapur");
        setLocationMessage("Location permission denied. Serving from central Kondapur Hub.");
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-diwali-pattern">
      {/* Festive Diwali Top Celebration Announcement Strip */}
      <div className="bg-gradient-to-r from-red-950 via-amber-950 to-orange-950 border-b border-amber-500/40 py-2.5 px-4 text-center text-xs text-amber-200 flex items-center justify-center gap-2 font-medium shadow-md">
        <span className="text-base diya-glow">🪔</span>
        <strong className="text-white">Shubh Deepavali & Nizami Dawat:</strong>
        <span>Celebrate with fresh dum deghs & royal mithai. Use coupon</span>
        <code className="bg-black/50 text-amber-300 px-2 py-0.5 rounded font-mono font-bold border border-amber-500/50">
          DIWALI20
        </code>
        <span>for 20% off direct orders!</span>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Col: Headlines & Value Prop */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#261533] border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-300 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Hyderabad's Crown Heritage • 14 Outlets & 3 Cloud Kitchens</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
                Slow-Cooked Dum, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400">
                  Golden Festive Dawats.
                </span>
              </h1>

              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
                Why pay 25–30% delivery app markups this Diwali? Order direct from our master deghs. Enjoy real-time kitchen tracking, transparent prep estimates, and earn 5% loyalty cashback on every direct feast.
              </p>

              {/* Outlet & Delivery Radius Picker Box with Clear Demarcations */}
              <div className="bg-[#1c1226] border-2 border-amber-500/40 p-6 rounded-3xl shadow-2xl max-w-xl">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Step 1: Choose Your Hyderabad Locality</span>
                  <button
                    onClick={handleGpsLocate}
                    className="text-amber-300 hover:text-white flex items-center gap-1 font-semibold normal-case text-xs"
                  >
                    <Navigation className={`w-3.5 h-3.5 ${locating ? "animate-spin" : ""}`} />
                    <span>{locating ? "Locating..." : "Use GPS"}</span>
                  </button>
                </div>

                {/* Popular Localities Chips with Tactile Boundaries */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {HYDERABAD_OUTLETS.slice(0, 8).map((o) => (
                    <button
                      key={o.id}
                      onClick={() => handleSelectLocality(o)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        selectedOutlet.id === o.id
                          ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold shadow-md shadow-amber-500/30 border-amber-300"
                          : "bg-[#271a36] text-gray-300 hover:text-white hover:bg-[#342347] border-gray-700/80 hover:border-amber-500/40"
                      }`}
                    >
                      {o.locality}
                    </button>
                  ))}
                </div>

                {/* Delivery confirmation message */}
                <div className="bg-[#130b1b] p-3 rounded-xl border border-amber-500/30 text-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span className="font-medium text-gray-200">{locationMessage}</span>
                  </div>
                  <span className="text-[11px] font-mono text-amber-400/90 shrink-0">
                    Lic. #{selectedOutlet.fssaiNumber}
                  </span>
                </div>

                {/* CTA to Menu */}
                <div className="mt-4 flex items-center gap-3">
                  <Link
                    href="/menu"
                    className="flex-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition shadow-xl shadow-amber-500/25 text-sm active:scale-98 border border-amber-300/40"
                  >
                    <span>Explore Diwali Menu</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/catering"
                    className="bg-[#291b38] hover:bg-[#352349] text-amber-300 font-bold py-3.5 px-4 rounded-xl border border-amber-500/40 text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Users className="w-4 h-4 text-amber-400" />
                    <span>Diwali Party</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Col: High Impact Visual & Unit Economics Card */}
            <div className="lg:col-span-5 space-y-6">
              {/* Food Visual Card with Golden Diwali Lighting */}
              <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 shadow-2xl group">
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80"
                  alt="Hyderabadi Chicken Dum Biryani"
                  className="w-full h-80 object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🪔</span>
                    <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                      Signature Diwali Dum Handi
                    </span>
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-white mt-1">
                    Authentic Hyderabadi Dum Biryani
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-200 mt-2 font-mono">
                    <span>From ₹360 (Inclusive 5% GST)</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">Mild to Dum Spicy</span>
                  </div>
                </div>
              </div>

              {/* Problem Statement Financial Recovery Card */}
              <div className="bg-[#180f24] border-2 border-emerald-500/40 p-5 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                    The Direct Ordering Model
                  </span>
                  <span className="font-mono text-[11px] bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded border border-emerald-600/40 font-bold">
                    ₹1.14 Cr / Year Saved
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Moving 12% of app sales to direct orders saves ₹95.04L in 27% app commissions. Online party orders recover 30 bulk inquiries/month (₹19.44L margin). Total bottom-line recovery: <strong>₹1.14 Crore</strong> annually.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars of Company A's Direct Experience */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xl">🪔</span>
            <span className="text-xs uppercase font-bold text-amber-400 tracking-widest font-mono">
              Festive Culinary Excellence
            </span>
            <span className="text-xl">🪔</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
            Designed for Speed, Taste & Transparency
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            No aggregator middleman. Pure Hyderabadi hospitality with real-time degh updates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#170f22] border-2 border-amber-500/30 p-6 rounded-2xl shadow-xl hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/30">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Checkout Under 60 Seconds</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Frictionless cart, saved favorites, instant UPI QR / 1-click test card payment, and 1-tap loyalty redemption.
            </p>
          </div>

          <div className="bg-[#170f22] border-2 border-amber-500/30 p-6 rounded-2xl shadow-xl hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Honest Kitchen Timers</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Our AI calculates real kitchen burner load and Friday dinner rush so promised times are honest. Orders 10m late trigger instant alerts & compensation.
            </p>
          </div>

          <div className="bg-[#170f22] border-2 border-amber-500/30 p-6 rounded-2xl shadow-xl hover:border-amber-400 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/30">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5% Direct Loyalty Cashback</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every direct order credits 5% back into your loyalty ledger. Redeem up to 20% on future biryani feasts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
