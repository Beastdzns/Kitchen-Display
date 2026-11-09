"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { DEMO_USERS } from "@/lib/constants";
import Link from "next/link";
import {
  UserCheck,
  ChefHat,
  ShieldAlert,
  Sparkles,
  LogIn,
  X,
  Phone,
  KeyRound,
  CheckCircle,
  Award,
  Flame,
  Zap,
} from "lucide-react";

export default function DemoBar() {
  const { currentUser, switchPersona, roleSwitchNotice, dismissRoleSwitchNotice } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      setOtpSent(true);
      setOtpInput("5520"); // Autofill demo OTP for reviewer convenience
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const matched =
      DEMO_USERS.find((u) => u.phone.includes(phoneInput.replace(/\D/g, "").slice(-10))) ||
      DEMO_USERS[0];
    switchPersona(matched);
    setShowLoginModal(false);
    setOtpSent(false);
    setPhoneInput("");
  };

  return (
    <>
      {/* 
        TOP REVIEWER DEMO PERSONA BAR
        Clearly demarcated with distinct boundaries, tactile buttons, and Diwali gold accents
      */}
      <div className="bg-[#120d18] border-b-2 border-amber-500/40 text-xs px-4 py-2.5 shadow-2xl relative z-50">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Role Switcher Label with Diya icon */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/50 shadow-sm font-bold uppercase tracking-wider text-[11px]">
              <span className="text-sm">🪔</span>
              <span className="text-amber-300">Role Switcher:</span>
            </div>
            <span className="hidden md:inline text-gray-400 text-[11px] font-medium">
              1-Click Instant Persona Preview
            </span>
          </div>

          {/* Center: Tactile Role Switcher Chips with Clear Demarcations */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5">
            {/* 1. Customer Amina */}
            <button
              onClick={() => switchPersona(DEMO_USERS[0])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border ${
                currentUser.id === "cust-amina"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30 scale-102"
                  : "bg-[#1f1629] text-gray-300 hover:text-white hover:bg-[#2c1f3a] border-gray-700/80 hover:border-amber-500/40"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Customer (Amina)</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-extrabold ${
                  currentUser.id === "cust-amina" ? "bg-black/30 text-black" : "bg-black/40 text-amber-300"
                }`}
              >
                340 pts
              </span>
            </button>

            {/* 2. Kitchen Tablet (Kondapur) */}
            <Link
              href="/kds"
              onClick={() => switchPersona(DEMO_USERS[1])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border ${
                currentUser.id === "staff-kondapur"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30 scale-102"
                  : "bg-[#1f1629] text-gray-300 hover:text-white hover:bg-[#2c1f3a] border-gray-700/80 hover:border-amber-500/40"
              }`}
            >
              <ChefHat className="w-3.5 h-3.5 shrink-0" />
              <span>KDS Tablet (Kondapur)</span>
            </Link>

            {/* 3. Central Admin */}
            <Link
              href="/admin/menu"
              onClick={() => switchPersona(DEMO_USERS[3])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border ${
                currentUser.id === "admin-central"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30 scale-102"
                  : "bg-[#1f1629] text-gray-300 hover:text-white hover:bg-[#2c1f3a] border-gray-700/80 hover:border-amber-500/40"
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Central Admin (Menu/86)</span>
            </Link>

            {/* 4. Catering Desk */}
            <Link
              href="/catering/desk"
              onClick={() => switchPersona(DEMO_USERS[4])}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all duration-200 border ${
                currentUser.id === "catering-manager"
                  ? "bg-gradient-to-r from-amber-400 to-amber-500 text-black border-amber-300 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/30 scale-102"
                  : "bg-[#1f1629] text-gray-300 hover:text-white hover:bg-[#2c1f3a] border-gray-700/80 hover:border-amber-500/40"
              }`}
            >
              <Award className="w-3.5 h-3.5 shrink-0" />
              <span>Catering Desk</span>
            </Link>
          </div>

          {/* Right: Current Active Indicator & Manual Sign-in */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 bg-[#1b1324] px-3 py-1 rounded-lg border border-gray-800">
              <span className="text-gray-400 text-[11px]">Active Persona:</span>
              <strong className="text-amber-300 font-semibold">{currentUser.name}</strong>
              <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30">
                {currentUser.role}
              </span>
            </div>

            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-[#251b32] hover:bg-[#322344] text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/40 font-bold transition shadow-sm text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / OTP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Gold Shimmer Divider Rule */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80" />

      {/* 
        MAJOR ROLE-SWITCH ANIMATION TOAST / OVERLAY
        Renders a rich celebratory Diwali banner when switching roles
      */}
      {roleSwitchNotice && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none">
          <div className="bg-[#180f24] border-2 border-amber-400 rounded-2xl p-4 shadow-2xl shadow-amber-500/20 text-gray-100 animate-role-switch-in pointer-events-auto relative overflow-hidden backdrop-blur-xl">
            {/* Top golden ambient glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-extrabold shadow-lg shrink-0 animate-role-badge-pop">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-extrabold uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                      Persona Switched
                    </span>
                    <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                      🪔 Diwali Live Demo
                    </span>
                  </div>
                  <h4 className="text-base font-serif font-bold text-white mt-0.5">
                    {roleSwitchNotice.title}
                  </h4>
                  <p className="text-xs text-gray-300 mt-1 leading-snug">
                    {roleSwitchNotice.description}
                  </p>
                </div>
              </div>

              <button
                onClick={dismissRoleSwitchNotice}
                className="text-gray-400 hover:text-white p-1 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick 2.8s animated dismiss progress bar */}
            <div className="w-full bg-gray-800/80 h-1 rounded-full mt-3 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full transition-all duration-[2800ms] w-0 animate-[shimmer_2.8s_linear]" />
            </div>
          </div>
        </div>
      )}

      {/* Realistic Sign-in with Phone OTP Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181122] border-2 border-amber-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl text-gray-100 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/40 shadow-lg">
                <span className="text-2xl">🪔</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-white">Sign In to Company A</h3>
              <p className="text-xs text-amber-400/90 mt-1 font-medium">
                Diwali Dawat Direct Ordering • Earn 5% Loyalty Points
              </p>
            </div>

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Mobile Number (India)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 font-mono text-sm">+91</span>
                    <input
                      type="tel"
                      required
                      placeholder="98490 12345"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="w-full bg-[#241733] border border-gray-700 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Protected under DPDP Act 2023. We never share your data.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 text-sm"
                >
                  Get 4-Digit OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-950/40 border border-emerald-600/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Demo OTP sent to {phoneInput || "+91 98490 12345"}. Pre-filled below:</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Enter OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-[#241733] border border-amber-500 rounded-xl px-4 py-2.5 text-center font-mono text-2xl tracking-widest text-amber-400 focus:outline-none shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-extrabold py-2.5 rounded-xl transition shadow-lg text-sm"
                >
                  Verify & Continue
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <span className="text-xs text-gray-400 block mb-2">Or select a pre-verified role:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchPersona(u);
                      setShowLoginModal(false);
                    }}
                    className="text-xs bg-[#241834] hover:bg-[#322247] text-gray-300 hover:text-white px-2.5 py-1 rounded-md border border-gray-700 font-medium"
                  >
                    {u.name} ({u.role})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
