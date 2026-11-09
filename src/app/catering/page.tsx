"use client";

import React, { useState } from "react";
import { PARTY_ORDER_MIN_GUESTS, PARTY_ORDER_MIN_NOTICE_HOURS, HYDERABAD_OUTLETS } from "@/lib/constants";
import {
  Users,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Flame,
  ArrowRight,
  Phone,
  FileText,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

export default function PartyCateringPage() {
  const tomorrow = new Date(Date.now() + 30 * 3600000).toISOString().split("T")[0];

  const [guestCount, setGuestCount] = useState<number>(25);
  const [eventDate, setEventDate] = useState<string>(tomorrow);
  const [selectedPackage, setSelectedPackage] = useState<string>("ROYAL_NIZAMI");
  const [contactName, setContactName] = useState<string>("Amina Khan");
  const [contactPhone, setContactPhone] = useState<string>("+91 98490 12345");
  const [preferredOutlet, setPreferredOutlet] = useState<string>("kondapur");
  const [customNotes, setCustomNotes] = useState<string>(
    "Corporate family dawat. Request brass-finish insulated handis and clay kulhads for tea."
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedPartyId, setSubmittedPartyId] = useState<string | null>(null);

  const PACKAGES: Record<string, { name: string; pricePerPax: number; desc: string; highlights: string[] }> = {
    ROYAL_NIZAMI: {
      name: "Royal Nizami Dawat",
      pricePerPax: 600,
      desc: "The ultimate Hyderabadi culinary celebration with authentic degh-sealed dishes.",
      highlights: [
        "Mutton Dum Biryani & Chicken Dum Biryani",
        "Authentic Chicken 65 & Tala Hua Gosht",
        "Hyderabadi Mirchi Ka Salan & Burani Raita",
        "Shahi Double Ka Meetha & Qubani Ka Meetha with Malai",
        "Irani Dum Chai with Osmania Biscuits",
      ],
    },
    SHAHI_DEGH: {
      name: "Shahi Degh Feast",
      pricePerPax: 480,
      desc: "Generous biryani handi feast ideal for family reunions and team lunches.",
      highlights: [
        "Chicken Dum Biryani (Generous portions)",
        "Crispy Chicken 65 or Veg Manchurian",
        "Mirchi Ka Salan & Cucumber Raita",
        "Double Ka Meetha",
      ],
    },
    SUBZ_DAWAT: {
      name: "Subz-e-Khaas Vegetarian Dawat",
      pricePerPax: 420,
      desc: "Delicately spiced vegetarian royal feast prepared in dedicated veg cookware.",
      highlights: [
        "Hyderabadi Subz Dum Biryani",
        "Charcoal Paneer Tikka Masala & Rumali Roti",
        "Mirchi Ka Salan & Raita",
        "Shahi Double Ka Meetha",
      ],
    },
  };

  const currentPkg = PACKAGES[selectedPackage];
  const estimatedTotal = guestCount * currentPkg.pricePerPax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (guestCount < PARTY_ORDER_MIN_GUESTS) {
      alert(`Minimum guest count is ${PARTY_ORDER_MIN_GUESTS} guests.`);
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/catering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: "cust-amina",
          eventDate,
          guestCount,
          contactPerson: contactName,
          contactPhone,
          packageName: currentPkg.name,
          customRequirements: customNotes,
          estimatedBudget: estimatedTotal,
          assignedOutletId: preferredOutlet,
        }),
      });

      const data = await res.json();
      if (res.ok && data.partyId) {
        setSubmittedPartyId(data.partyId);
      } else {
        alert(data.error || "Failed to submit party order");
      }
    } catch (err) {
      console.error("Party submission error:", err);
      alert("Network error submitting request");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedPartyId) {
    return (
      <div className="flex-1 bg-[#0e1014] text-gray-100 flex items-center justify-center p-8">
        <div className="bg-[#161822] border border-amber-500/40 rounded-3xl p-8 max-w-lg w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-white">Party Order Received!</h2>
          <div className="font-mono text-2xl font-extrabold text-amber-400">{submittedPartyId}</div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Salaam {contactName}! Your corporate/family dawat request for <strong>{guestCount} guests</strong> has been forwarded to Farhan Siddiqui (Catering Lead) and the master chefs at {HYDERABAD_OUTLETS.find((o) => o.id === preferredOutlet)?.name}.
          </p>
          <div className="bg-[#12141a] p-4 rounded-xl border border-gray-800 text-xs text-gray-400 space-y-1">
            <div className="flex justify-between">
              <span>Event Date:</span>
              <span className="text-white font-mono">{eventDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Selected Package:</span>
              <span className="text-white font-semibold">{currentPkg.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Budget:</span>
              <span className="text-amber-400 font-mono font-bold">₹{estimatedTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/catering/desk"
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-3 px-6 rounded-xl text-xs transition shadow-lg shadow-amber-500/20"
            >
              View in Catering Manager Desk
            </Link>
            <Link
              href="/menu"
              className="text-xs text-gray-400 hover:text-white py-2 underline"
            >
              Back to Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0e1014] text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3.5 py-1.5 rounded-full text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Nizami Feasts for 15 to 500+ Guests</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white">
            Hyderabadi Dawat & Bulk Catering
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Eliminating missed phone orders. Direct confirmation by our dedicated catering manager with live degh seal and authentic brass handi presentation.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Guest count, date, packages (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Guest count and Date */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>1. Event Scope & Advance Notice</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Number of Guests (Min. {PARTY_ORDER_MIN_GUESTS} pax)
                  </label>
                  <input
                    type="number"
                    min={PARTY_ORDER_MIN_GUESTS}
                    max={1000}
                    value={guestCount}
                    onChange={(e) => setGuestCount(parseInt(e.target.value) || PARTY_ORDER_MIN_GUESTS)}
                    className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-amber-400 mt-1 block">
                    *Bulk catering requires minimum {PARTY_ORDER_MIN_GUESTS} guests
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Event Date (Min. {PARTY_ORDER_MIN_NOTICE_HOURS}h notice)
                  </label>
                  <input
                    type="date"
                    min={tomorrow}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 font-mono text-sm font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-emerald-400 mt-1 block">
                    *24h notice ensures authentic slow dum preparation
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2: Dawat Packages */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>2. Select Royal Dawat Package</span>
              </h3>

              <div className="space-y-3">
                {Object.entries(PACKAGES).map(([key, pkg]) => {
                  const isSelected = selectedPackage === key;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedPackage(key)}
                      className={`p-4 rounded-xl border-2 transition cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10"
                          : "bg-[#202432] border-gray-800 hover:border-gray-700"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{pkg.name}</span>
                          {key === "ROYAL_NIZAMI" && (
                            <span className="text-[10px] bg-amber-500 text-black font-extrabold uppercase px-2 py-0.5 rounded">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{pkg.desc}</p>
                        <ul className="text-xs text-gray-300 space-y-1 pt-1">
                          {pkg.highlights.map((h, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-[11px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono text-xl font-extrabold text-amber-400">
                          ₹{pkg.pricePerPax}
                        </div>
                        <div className="text-[10px] text-gray-400">per person (Incl. GST)</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Contact & Notes */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>3. Point of Contact & Delivery Notes</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1">
                    Mobile Number (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Preferred Preparing Outlet Hub
                </label>
                <select
                  value={preferredOutlet}
                  onChange={(e) => setPreferredOutlet(e.target.value)}
                  className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-semibold"
                >
                  {HYDERABAD_OUTLETS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.locality})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Custom Chef Requirements
                </label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  className="w-full bg-[#202432] border border-gray-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Quotation Card (5 cols) */}
          <div className="lg:col-span-5 space-y-6 sticky top-24">
            <div className="bg-[#161822] border border-amber-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
              <h3 className="font-serif text-lg font-bold text-white pb-3 border-b border-gray-800 flex items-center justify-between">
                <span>Estimated Quotation</span>
                <span className="text-xs font-mono text-amber-400 font-normal">5% GST Included</span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>Guest Count:</span>
                  <span className="text-white font-bold">{guestCount} pax</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Package Selected:</span>
                  <span className="text-white font-semibold">{currentPkg.name}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Price Per Person:</span>
                  <span>₹{currentPkg.pricePerPax}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Degh Sealing & Insulated Handis:</span>
                  <span className="text-emerald-400">INCLUDED</span>
                </div>

                <div className="pt-3 border-t border-gray-800 flex justify-between text-base font-bold text-white">
                  <span>Estimated Total:</span>
                  <span className="text-2xl text-amber-400 font-extrabold font-mono">
                    ₹{estimatedTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="bg-[#12141c] p-3.5 rounded-xl border border-gray-800 text-xs text-gray-300 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>2-Hour Manager Confirmation SLA</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Farhan Siddiqui (Catering Lead) will review handi allocation, confirm staff availability, and send your finalized quote with payment link via WhatsApp.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 text-sm transition shadow-xl shadow-amber-500/20 active:scale-98"
              >
                <span>{submitting ? "Submitting Inquiry..." : "Submit Catering Order Request"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

