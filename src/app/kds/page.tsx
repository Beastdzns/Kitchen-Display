"use client";

import React, { useEffect, useState, useRef } from "react";
import { getSocketClient } from "@/lib/socket/client";
import { HYDERABAD_OUTLETS, HyderabadOutletSeed } from "@/lib/constants";
import { kitchenSound } from "@/lib/sound";
import {
  Clock,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  RefreshCw,
  PlusCircle,
  XCircle,
} from "lucide-react";

interface OrderItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  portionSize: string | null;
  selectedAddons: string;
}

interface KDSTicket {
  id: string;
  orderType: "DELIVERY" | "PICKUP";
  status: "RECEIVED" | "PREPARING" | "READY_FOR_PICKUP" | "RIDER_HANDOFF" | "DELIVERED" | "CANCELLED";
  subtotal: number;
  totalAmount: number;
  paymentMethod: "UPI" | "CARD";
  placedAt: string;
  promisedAt: string;
  aiEstimatedPrepMinutes: number;
  managerOverrideMinutes: number;
  lateAlertTriggered: number;
  deliveryAddress: string;
  customerNotes?: string;
  items: OrderItem[];
  isLate?: boolean;
  minutesLate?: number;
}

export default function KitchenDisplayPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string>("kondapur");
  const [outlet, setOutlet] = useState<HyderabadOutletSeed>(HYDERABAD_OUTLETS[0]);
  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [show86Drawer, setShow86Drawer] = useState<boolean>(false);
  const [menuItemsList, setMenuItemsList] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const socketRef = useRef<any>(null);

  // Keep live clock updating every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch KDS tickets for selected outlet
  const fetchTickets = async (outletId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/kds/orders?outletId=${outletId}`);
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
      if (data.outlet) {
        setOutlet(data.outlet);
      }
    } catch (err) {
      console.error("Failed fetching KDS tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch menu for 86ing drawer
  const fetchMenuItems = async (outletId: string) => {
    try {
      const res = await fetch(`/api/menu?outletId=${outletId}`);
      const data = await res.json();
      if (data.items) {
        setMenuItemsList(data.items);
      }
    } catch (err) {
      console.error("Failed fetching menu for 86ing:", err);
    }
  };

  useEffect(() => {
    const currentOutlet = HYDERABAD_OUTLETS.find((o) => o.id === selectedOutletId) || HYDERABAD_OUTLETS[0];
    setOutlet(currentOutlet);
    fetchTickets(selectedOutletId);
    fetchMenuItems(selectedOutletId);

    // Socket Setup
    const socket = getSocketClient();
    socketRef.current = socket;

    socket.emit("join:outlet", selectedOutletId);

    const handleTicketUpdate = (payload: any) => {
      console.log("Real-time KDS ticket event received:", payload);
      // Play alert if new order or status update
      kitchenSound.playNewOrderChime();
      fetchTickets(selectedOutletId);
    };

    const handleAvailabilityChange = (payload: any) => {
      if (payload.outletId === selectedOutletId) {
        fetchMenuItems(selectedOutletId);
      }
    };

    socket.on("kds:ticket_updated", handleTicketUpdate);
    socket.on("kds:order_created", handleTicketUpdate);
    socket.on("menu:item_availability_changed", handleAvailabilityChange);

    return () => {
      socket.off("kds:ticket_updated", handleTicketUpdate);
      socket.off("kds:order_created", handleTicketUpdate);
      socket.off("menu:item_availability_changed", handleAvailabilityChange);
    };
  }, [selectedOutletId]);

  // Update order status action
  const handleAdvanceStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus = "PREPARING";
    if (currentStatus === "RECEIVED") nextStatus = "PREPARING";
    else if (currentStatus === "PREPARING") nextStatus = "READY_FOR_PICKUP";
    else if (currentStatus === "READY_FOR_PICKUP") nextStatus = "RIDER_HANDOFF";
    else if (currentStatus === "RIDER_HANDOFF") nextStatus = "DELIVERED";

    try {
      const res = await fetch("/api/kds/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      if (res.ok) {
        fetchTickets(selectedOutletId);
        kitchenSound.playNewOrderChime();
      }
    } catch (err) {
      console.error("Failed advancing order status:", err);
    }
  };

  // Manager Override (+5m / +10m)
  const handleManagerOverride = async (orderId: string, overrideMinutes: number) => {
    try {
      const res = await fetch("/api/kds/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, overrideMinutes }),
      });
      if (res.ok) {
        fetchTickets(selectedOutletId);
        kitchenSound.playNewOrderChime();
      }
    } catch (err) {
      console.error("Failed overriding prep time:", err);
    }
  };

  // Toggle item 86-ing (Out of stock)
  const handleToggle86 = async (menuItemId: string, currentAvailable: boolean) => {
    const nextVal = currentAvailable ? 0 : 1;
    try {
      await fetch("/api/menu/toggle-86", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outletId: selectedOutletId,
          menuItemId,
          isAvailable: nextVal,
        }),
      });
      fetchMenuItems(selectedOutletId);
    } catch (err) {
      console.error("Failed toggling 86 state:", err);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (filterStage === "ALL") return true;
    return t.status === filterStage;
  });

  // Calculate kitchen load percentage
  const staff = outlet.currentStaffCount || 8;
  const maxCapacity = Math.round(staff * 2.5);
  const loadPercentage = Math.min(100, Math.round((tickets.length / maxCapacity) * 100));

  return (
    <div className="min-h-screen bg-[#0e1014] text-gray-100 flex flex-col font-sans select-none">
      {/* 2-Metre High-Contrast Header Bar */}
      <header className="bg-[#171920] border-b border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-2xl">
        {/* Left: Outlet & FSSAI Info */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center font-bold text-black shadow-lg">
            <Flame className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <select
                value={selectedOutletId}
                onChange={(e) => setSelectedOutletId(e.target.value)}
                className="bg-[#242833] text-xl font-bold text-white border border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                {HYDERABAD_OUTLETS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.type === "CLOUD_KITCHEN" ? "Cloud Kitchen" : "Dine-In/Delivery"})
                  </option>
                ))}
              </select>
              <span className="text-xs bg-amber-500/20 text-amber-300 font-semibold px-2.5 py-1 rounded-md border border-amber-500/30">
                KDS TERMINAL
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Lic. #{outlet.fssaiNumber}
              </span>
              <span>•</span>
              <span>Staff on duty: <strong className="text-white">{staff} cooks</strong></span>
              <span>•</span>
              <span className="hidden sm:inline">{outlet.address}</span>
            </div>
          </div>
        </div>

        {/* Center: Live Kitchen Load Bar */}
        <div className="hidden lg:flex items-center gap-3 bg-[#20232c] px-4 py-2 rounded-xl border border-gray-700">
          <div className="text-right">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Kitchen Load</div>
            <div className="text-lg font-bold text-white">{loadPercentage}% ({tickets.length}/{maxCapacity} Pots)</div>
          </div>
          <div className="w-32 h-3.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                loadPercentage > 85 ? "bg-red-500" : loadPercentage > 60 ? "bg-amber-500" : "bg-emerald-500"
              }`}
              style={{ width: `${loadPercentage}%` }}
            />
          </div>
        </div>

        {/* Right: Controls & Time */}
        <div className="flex items-center gap-3">
          {/* Station 86 Drawer Button */}
          <button
            onClick={() => setShow86Drawer(!show86Drawer)}
            className="flex items-center gap-2 bg-[#252a36] hover:bg-[#2d3342] text-amber-300 border border-amber-500/40 px-3.5 py-2 rounded-lg text-sm font-semibold transition shadow-md"
          >
            <Layers className="w-4 h-4" />
            <span>Station Stock (86)</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              kitchenSound.setMuted(nextMuted);
              if (!nextMuted) kitchenSound.playNewOrderChime();
            }}
            className={`p-2.5 rounded-lg border transition ${
              isMuted
                ? "bg-gray-800 text-gray-400 border-gray-700"
                : "bg-emerald-950/60 text-emerald-400 border-emerald-600/50 shadow-md"
            }`}
            title={isMuted ? "Unmute Kitchen Chimes" : "Mute Chimes"}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchTickets(selectedOutletId)}
            className="p-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg border border-gray-700 transition"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-amber-400" : ""}`} />
          </button>

          {/* Live Digital Clock */}
          <div className="bg-[#232732] px-4 py-2 rounded-lg border border-gray-700 font-mono text-xl font-bold tracking-wider text-amber-400">
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
        </div>
      </header>

      {/* Stage Filter Buttons Bar */}
      <div className="bg-[#13151b] border-b border-gray-800/80 px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
        <div className="flex items-center gap-2">
          {["ALL", "RECEIVED", "PREPARING", "READY_FOR_PICKUP", "RIDER_HANDOFF"].map((stage) => {
            const count =
              stage === "ALL" ? tickets.length : tickets.filter((t) => t.status === stage).length;
            const labels: Record<string, string> = {
              ALL: "All Active Tickets",
              RECEIVED: "New Orders",
              PREPARING: "On Dum / Cooking",
              READY_FOR_PICKUP: "Ready for Pickup",
              RIDER_HANDOFF: "Rider Handoff",
            };
            const active = filterStage === stage;
            return (
              <button
                key={stage}
                onClick={() => setFilterStage(stage)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition flex items-center gap-2 ${
                  active
                    ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                    : "bg-[#1f222b] text-gray-300 hover:bg-[#282d39]"
                }`}
              >
                <span>{labels[stage]}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    active ? "bg-black/30 text-black font-extrabold" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="text-xs text-gray-400 flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> On Time
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Approaching
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" /> Late
          </span>
        </div>
      </div>

      {/* Main KDS Grid View (High Contrast, 2m distance readability) */}
      <main className="flex-1 p-6 overflow-y-auto">
        {loading && tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <RefreshCw className="w-10 h-10 animate-spin text-amber-500 mb-3" />
            <p className="text-lg font-medium">Connecting to station orders stream...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-gray-400 border-2 border-dashed border-gray-800 rounded-2xl">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-4 opacity-80" />
            <h3 className="text-2xl font-bold text-gray-200">Station Clear! All Orders Handed Off</h3>
            <p className="text-sm text-gray-500 mt-1">New incoming orders from direct web checkout will chime immediately.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTickets.map((ticket) => {
              const placedDate = new Date(ticket.placedAt);
              const promisedDate = new Date(ticket.promisedAt);
              const remainingMs = promisedDate.getTime() - currentTime.getTime();
              const remainingMins = Math.round(remainingMs / 60000);
              const isLate = remainingMins < 0 || ticket.lateAlertTriggered === 1;
              const isWarning = remainingMins >= 0 && remainingMins <= 5;

              return (
                <div
                  key={ticket.id}
                  className={`flex flex-col rounded-2xl bg-[#161820] border-2 transition-all duration-300 shadow-xl overflow-hidden ${
                    isLate
                      ? "border-red-500 ticket-late-pulse"
                      : isWarning
                      ? "border-amber-500/80 shadow-amber-500/10"
                      : "border-gray-800 hover:border-gray-700"
                  }`}
                >
                  {/* Ticket Header Bar */}
                  <div
                    className={`px-5 py-3.5 flex items-center justify-between border-b ${
                      isLate
                        ? "bg-red-950/70 border-red-800 text-red-200"
                        : isWarning
                        ? "bg-amber-950/50 border-amber-800/80 text-amber-200"
                        : "bg-[#1d212c] border-gray-800 text-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-extrabold tracking-tight text-white">
                        {ticket.id}
                      </span>
                      <span className="text-xs uppercase font-bold px-2 py-0.5 rounded bg-black/40 text-amber-400">
                        {ticket.orderType}
                      </span>
                    </div>

                    {/* Timer Badge */}
                    <div className="text-right">
                      {isLate ? (
                        <div className="flex items-center gap-1.5 text-red-400 font-bold text-sm uppercase animate-pulse">
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                          <span>LATE BY {Math.abs(remainingMins)}M</span>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-1.5 font-mono text-xl font-bold ${
                            isWarning ? "text-amber-400" : "text-emerald-400"
                          }`}
                        >
                          <Clock className="w-5 h-5" />
                          <span>{remainingMins}m left</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timing Meta Strip */}
                  <div className="bg-[#12141a] px-5 py-2 text-xs flex items-center justify-between text-gray-400 border-b border-gray-800/60 font-mono">
                    <span>Placed: <strong className="text-gray-200">{placedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    <span>Promised: <strong className="text-amber-300">{promisedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                    <span className="text-gray-400">{ticket.paymentMethod} • ₹{ticket.totalAmount}</span>
                  </div>

                  {/* Items List (Large 2m legible typography) */}
                  <div className="p-5 flex-1 space-y-3">
                    {ticket.items.map((item, idx) => (
                      <div key={idx} className="flex items-start justify-between gap-3 border-b border-gray-800/50 pb-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="w-7 h-7 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-lg flex items-center justify-center font-mono shrink-0">
                            {item.quantity}x
                          </span>
                          <div>
                            <div className="text-lg font-bold text-white leading-tight">
                              {item.itemName}
                            </div>
                            {item.portionSize && (
                              <div className="text-xs text-amber-400/90 font-medium">
                                {item.portionSize}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Customer Notes */}
                    {ticket.customerNotes && (
                      <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-2.5 text-xs text-amber-200 mt-2">
                        <strong>Chef Note:</strong> {ticket.customerNotes}
                      </div>
                    )}
                  </div>

                  {/* Manager Override Controls */}
                  <div className="bg-[#181a22] px-5 py-2.5 border-t border-gray-800/80 flex items-center justify-between text-xs">
                    <span className="text-gray-400 font-medium">Extend Prep:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManagerOverride(ticket.id, 5)}
                        className="bg-[#242834] hover:bg-[#2e3444] text-amber-300 font-mono font-bold px-2.5 py-1 rounded border border-gray-700 transition"
                        title="Extend promised time by 5 minutes"
                      >
                        +5 min
                      </button>
                      <button
                        onClick={() => handleManagerOverride(ticket.id, 10)}
                        className="bg-[#242834] hover:bg-[#2e3444] text-amber-300 font-mono font-bold px-2.5 py-1 rounded border border-gray-700 transition"
                        title="Extend promised time by 10 minutes"
                      >
                        +10 min
                      </button>
                    </div>
                  </div>

                  {/* Big Primary Status Advance Button */}
                  <div className="p-4 bg-[#14161d] border-t border-gray-800">
                    <button
                      onClick={() => handleAdvanceStatus(ticket.id, ticket.status)}
                      className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base uppercase tracking-wide flex items-center justify-center gap-2 transition shadow-lg ${
                        ticket.status === "RECEIVED"
                          ? "bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20"
                          : ticket.status === "PREPARING"
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                          : ticket.status === "READY_FOR_PICKUP"
                          ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                          : "bg-purple-600 hover:bg-purple-500 text-white"
                      }`}
                    >
                      <span>
                        {ticket.status === "RECEIVED" && "Simmer On Dum (Start Prep)"}
                        {ticket.status === "PREPARING" && "Mark Ready for Pickup"}
                        {ticket.status === "READY_FOR_PICKUP" && "Rider Handoff (Dispatch)"}
                        {ticket.status === "RIDER_HANDOFF" && "Complete Delivery"}
                      </span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Station 86ing Drawer (Pause Out-of-Stock Items) */}
      {show86Drawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-[#161922] h-full shadow-2xl border-l border-gray-800 flex flex-col p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  Station 86-ing Control
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Pause items when a handi empties. Broadcasts immediately to all customer devices.
                </p>
              </div>
              <button
                onClick={() => setShow86Drawer(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {menuItemsList.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#1f232e] p-3.5 rounded-xl border border-gray-800 flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="font-bold text-white text-sm">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">₹{item.price} • {item.portionSize}</div>
                  </div>
                  <button
                    onClick={() => handleToggle86(item.id, item.isAvailable)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                      item.isAvailable
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-600/50 hover:bg-emerald-900"
                        : "bg-red-950/80 text-red-400 border border-red-600/50 hover:bg-red-900"
                    }`}
                  >
                    {item.isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" /> 86'd (Paused)
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-800">
              <button
                onClick={() => setShow86Drawer(false)}
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-2.5 rounded-xl transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
