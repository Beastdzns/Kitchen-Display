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
} from "lucide-react";

export default function DemoBar() {
  const { currentUser, setCurrentUser } = useApp();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const handleQuickSwitch = (user: any) => {
    setCurrentUser(user);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.length >= 10) {
      setOtpSent(true);
      setOtpInput("5520"); // Autofill demo OTP for reviewer convenience
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Find matching user or fallback to Amina
    const matched = DEMO_USERS.find((u) => u.phone.includes(phoneInput.replace(/\D/g, "").slice(-10))) || DEMO_USERS[0];
    setCurrentUser(matched);
    setShowLoginModal(false);
    setOtpSent(false);
    setPhoneInput("");
  };

  return (
    <>
      {/* Top Demo Persona Navigation Bar */}
      <div className="bg-[#12141a] border-b border-amber-500/30 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-gray-300 z-50 relative">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Reviewer Demo Switcher:
          </span>
          <span className="hidden sm:inline text-gray-400">1-Click Role Switch:</span>
        </div>

        {/* Quick Persona Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* Customer */}
          <button
            onClick={() => handleQuickSwitch(DEMO_USERS[0])}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
              currentUser.id === "cust-amina"
                ? "bg-amber-500 text-black shadow-sm"
                : "bg-[#1c202a] hover:bg-[#252b38] text-gray-200"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer (Amina)</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.2 rounded font-mono text-amber-200">
              340 pts
            </span>
          </button>

          {/* Kitchen Tablet (Kondapur) */}
          <Link
            href="/kds"
            onClick={() => handleQuickSwitch(DEMO_USERS[1])}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
              currentUser.id === "staff-kondapur"
                ? "bg-amber-500 text-black shadow-sm"
                : "bg-[#1c202a] hover:bg-[#252b38] text-gray-200"
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>KDS Tablet (Kondapur)</span>
          </Link>

          {/* Central Admin */}
          <Link
            href="/admin/menu"
            onClick={() => handleQuickSwitch(DEMO_USERS[3])}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
              currentUser.id === "admin-central"
                ? "bg-amber-500 text-black shadow-sm"
                : "bg-[#1c202a] hover:bg-[#252b38] text-gray-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Central Admin (Menu/86)</span>
          </Link>

          {/* Catering Desk */}
          <Link
            href="/catering/desk"
            onClick={() => handleQuickSwitch(DEMO_USERS[4])}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition ${
              currentUser.id === "catering-manager"
                ? "bg-amber-500 text-black shadow-sm"
                : "bg-[#1c202a] hover:bg-[#252b38] text-gray-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Catering Desk</span>
          </Link>
        </div>

        {/* Right side: Active user and regular Sign In modal trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-gray-300">
            <span className="text-gray-400">Signed in as:</span>
            <strong className="text-amber-300">{currentUser.name}</strong>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="flex items-center gap-1 bg-[#232733] hover:bg-[#2e3444] text-amber-300 px-2.5 py-1 rounded border border-gray-700 font-semibold"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / OTP</span>
          </button>
        </div>
      </div>

      {/* Realistic Sign-in with Phone OTP Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171922] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-gray-100 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Sign In to Company A</h3>
              <p className="text-xs text-gray-400 mt-1">
                Direct orders earn 5% loyalty cashback and skip delivery app commissions.
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
                      className="w-full bg-[#202430] border border-gray-700 rounded-xl pl-12 pr-4 py-2.5 text-white font-mono focus:outline-none focus:border-amber-500 text-sm"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                    Protected under DPDP Act 2023. We never share your data.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition shadow-lg shadow-amber-500/20 text-sm"
                >
                  Get 4-Digit OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="bg-emerald-950/40 border border-emerald-600/40 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Demo OTP sent to {phoneInput || "+91 98490 12345"}. Pre-filled below for quick review:</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">Enter OTP Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full bg-[#202430] border border-gray-700 rounded-xl px-4 py-2.5 text-center font-mono text-2xl tracking-widest text-amber-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition shadow-lg text-sm"
                >
                  Verify & Continue
                </button>
              </form>
            )}

            {/* Quick pre-set accounts */}
            <div className="mt-6 pt-4 border-t border-gray-800 text-center">
              <span className="text-xs text-gray-400 block mb-2">Or select a pre-verified role:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {DEMO_USERS.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowLoginModal(false);
                    }}
                    className="text-xs bg-[#222633] hover:bg-[#2b3040] text-gray-300 px-2.5 py-1 rounded-md border border-gray-700"
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
