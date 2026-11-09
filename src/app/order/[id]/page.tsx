"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSocketClient } from "@/lib/socket/client";
import {
  Clock,
  Flame,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Package,
  Bike,
  Sparkles,
  Phone,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";

interface OrderData {
  order: any;
  items: any[];
  outlet: any;
  customer: any;
  notifications: any[];
  lateness: {
    isLate: boolean;
    isPastGracePeriod: boolean;
    minutesLate: number;
  };
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params?.id as string;

  const [data, setData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showNotificationsModal, setShowNotificationsModal] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed fetching order:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Live clock timer
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);

    // Socket.io real-time connection to live order room
    const socket = getSocketClient();
    socket.emit("join:order", orderId);

    const handleStatusUpdate = (payload: any) => {
      console.log("Real-time order status update received:", payload);
      fetchOrder();
    };

    const handleTimeAdjust = (payload: any) => {
      console.log("Real-time promised time adjusted:", payload);
      fetchOrder();
    };

    socket.on("order:status_updated", handleStatusUpdate);
    socket.on("order:promised_time_adjusted", handleTimeAdjust);

    return () => {
      clearInterval(interval);
      socket.off("order:status_updated", handleStatusUpdate);
      socket.off("order:promised_time_adjusted", handleTimeAdjust);
    };
  }, [orderId]);

  if (loading && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] bg-[#0e1014] text-gray-100">
        <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-white">Connecting to Degh Tracking...</h3>
        <p className="text-xs text-gray-500 mt-1">Retrieving live station data for #{orderId}</p>
      </div>
    );
  }

  if (!data || !data.order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] bg-[#0e1014] text-gray-100">
        <h3 className="text-xl font-bold text-white">Order Not Found</h3>
        <p className="text-xs text-gray-400 mt-2">Could not find order ID #{orderId}.</p>
        <Link href="/menu" className="mt-4 text-xs font-bold text-amber-400 underline">
          Return to Menu
        </Link>
      </div>
    );
  }

  const { order, items, outlet, customer, notifications, lateness } = data;
  const placedDate = new Date(order.placedAt);
  const promisedDate = new Date(order.promisedAt);
  const remainingMs = promisedDate.getTime() - currentTime.getTime();
  const remainingMins = Math.round(remainingMs / 60000);
  const isBreached = remainingMins < -10 || order.lateAlertTriggered === 1;

  // Pipeline stages
  const STAGES = [
    { key: "RECEIVED", label: "Order Received", desc: "Ticket printed at degh station" },
    { key: "PREPARING", label: "Simmering on Dum", desc: "Sealed handi on slow charcoal flame" },
    { key: "READY_FOR_PICKUP", label: "Freshly Packed", desc: "Quality checked & sealed in thermal bag" },
    { key: "RIDER_HANDOFF", label: "Out for Delivery", desc: "Handed over to delivery partner" },
    { key: "DELIVERED", label: "Delivered", desc: "Enjoy authentic Hyderabad flavors!" },
  ];

  const getStageIndex = (status: string) => {
    const idx = STAGES.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStageIndex = getStageIndex(order.status);

  return (
    <div className="flex-1 bg-diwali-pattern text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-[#170f22] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl diya-glow">🪔</span>
              <span className="font-mono text-2xl font-extrabold text-white">{order.id}</span>
              <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {order.status.replace(/_/g, " ")}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>Prepared at: <strong className="text-amber-300">{outlet.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">FSSAI #{outlet.fssaiNumber}</span>
            </p>
          </div>

          {/* Simulated WhatsApp / SMS Button */}
          <button
            onClick={() => setShowNotificationsModal(true)}
            className="flex items-center gap-2 bg-[#202534] hover:bg-[#282f42] text-amber-300 border border-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition shadow-md"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span>Simulated WhatsApp/SMS Updates ({notifications.length})</span>
          </button>
        </div>

        {/* 10-Minute Past Promise Late Alert Banner (Guardrail 3 Requirement) */}
        {isBreached && (
          <div className="bg-red-950/60 border-2 border-red-600/80 rounded-2xl p-5 shadow-2xl ticket-late-pulse flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-red-300">
                  Chef Delay Apology Notice (Guardrail Triggered)
                </h4>
                <span className="text-[10px] font-mono bg-red-900/60 text-red-200 px-2 py-0.5 rounded">
                  Past 10m Grace Threshold
                </span>
              </div>
              <p className="text-xs text-red-200 mt-1 leading-relaxed">
                We apologize—dinner degh volume at {outlet.name} has temporarily surged. The outlet manager has been alerted to prioritize your ticket. We have credited <strong>50 complimentary loyalty points</strong> to your account for the wait.
              </p>
            </div>
          </div>
        )}

        {/* Live Countdown & AI Prep Estimate Card */}
        <div className="bg-gradient-to-br from-[#191c28] to-[#13151f] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800/80">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Honest Promised Time
              </div>
              <div className="font-mono text-3xl font-extrabold text-amber-400 mt-0.5">
                {promisedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Current Kitchen ETA
              </div>
              <div className="flex items-center sm:justify-end gap-1.5 font-mono text-2xl font-bold text-white mt-0.5">
                <Clock className="w-5 h-5 text-amber-500" />
                <span>
                  {remainingMins > 0
                    ? `~${remainingMins} mins remaining`
                    : order.status === "DELIVERED"
                    ? "Feast Delivered"
                    : `Simmering (Overdue by ${Math.abs(remainingMins)}m)`}
                </span>
              </div>
            </div>
          </div>

          {/* AI Explainability Strip */}
          <div className="bg-[#12141c] p-3.5 rounded-xl border border-gray-800 text-xs text-gray-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">AI Kitchen Load Physics:</strong> Prep-time was computed based on {outlet.name}’s active burner queue and culinary complexity. Outlet standard minimum is {outlet.minPrepTimeMinutes} mins.
            </div>
          </div>
        </div>

        {/* Interactive Real-Time Pipeline Progress */}
        <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Live Order Pipeline (Real-Time WebSockets)
          </h3>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-800" />

            <div className="space-y-6 relative">
              {STAGES.map((stg, idx) => {
                const isPassed = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stg.key} className="flex items-start gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 transition-all z-10 ${
                        isPassed
                          ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                          : isCurrent
                          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/30 animate-pulse ring-4 ring-amber-500/20"
                          : "bg-gray-800 text-gray-500 border border-gray-700"
                      }`}
                    >
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold text-sm ${
                            isCurrent ? "text-amber-400" : isPassed ? "text-white" : "text-gray-500"
                          }`}
                        >
                          {stg.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-mono uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Items Card */}
        <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-800">
            Order Items & Receipt
          </h3>

          <div className="divide-y divide-gray-800/80">
            {items.map((it: any) => (
              <div key={it.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{it.itemName}</div>
                  <div className="text-gray-400">{it.portionSize} • Qty: {it.quantity}</div>
                </div>
                <div className="font-mono font-bold text-white">
                  ₹{it.unitPrice * it.quantity}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-800 space-y-1 text-xs font-mono">
            <div className="flex justify-between text-gray-400">
              <span>Payment:</span>
              <span className="text-white font-bold">{order.paymentMethod} (PAID)</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>GST (Included 5%):</span>
              <span className="text-emerald-400">₹{order.gstAmount}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-1">
              <span>Total Paid:</span>
              <span className="text-amber-400 font-extrabold text-lg">₹{order.totalAmount}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-800 text-xs text-gray-400">
            <span className="font-semibold text-gray-300">Delivery Address:</span> {order.deliveryAddress}
          </div>
        </div>
      </div>

      {/* Simulated WhatsApp / SMS Modal */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#171a24] border border-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowNotificationsModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Simulated WhatsApp & SMS Stream</h3>
            </div>
            <p className="text-xs text-gray-400">
              Automated message delivery audit trail for {customer?.phone || "0000000001"}:
            </p>

            <div className="max-h-72 overflow-y-auto space-y-3 py-2">
              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No notifications logged yet.</p>
              ) : (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className="bg-[#202534] border border-gray-700/80 rounded-xl p-3.5 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span className="bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-700/40">
                        {n.channel}
                      </span>
                      <span>{new Date(n.sentAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-200 leading-relaxed font-sans">{n.messageText}</p>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotificationsModal(false)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition text-xs"
            >
              Close Stream
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
