"use client";

import React, { useEffect, useState } from "react";
import { HYDERABAD_OUTLETS } from "@/lib/constants";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Users,
  DollarSign,
  FileText,
  Phone,
  RefreshCw,
  Building,
  Sparkles,
} from "lucide-react";

export default function CateringManagerDeskPage() {
  const [partyOrdersList, setPartyOrdersList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [chefNotesInput, setChefNotesInput] = useState<string>("");
  const [budgetInput, setBudgetInput] = useState<number>(0);
  const [outletInput, setOutletInput] = useState<string>("");

  const fetchPartyOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/catering");
      if (res.ok) {
        const data = await res.json();
        setPartyOrdersList(data.partyOrders || []);
      }
    } catch (err) {
      console.error("Failed fetching party orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartyOrders();
  }, []);

  const handleUpdateStatus = async (partyId: string, status: string) => {
    try {
      const res = await fetch(`/api/catering/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPartyOrders();
    } catch (err) {
      console.error("Failed updating status:", err);
    }
  };

  const handleSaveAdjustments = async (partyId: string) => {
    try {
      const res = await fetch(`/api/catering/${partyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cateringManagerNotes: chefNotesInput,
          estimatedBudget: budgetInput,
          assignedOutletId: outletInput,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        fetchPartyOrders();
      }
    } catch (err) {
      console.error("Failed saving adjustments:", err);
    }
  };

  return (
    <div className="flex-1 bg-[#0e1014] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Catering & Bulk Operations Desk</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-white">
              Party & Bulk Dawat Confirmation Desk
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Review and confirm large corporate & family feasts (15+ guests, 24h notice).
            </p>
          </div>

          <button
            onClick={fetchPartyOrders}
            className="flex items-center gap-2 bg-[#1e222d] hover:bg-[#282d3a] text-gray-200 border border-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-amber-400" : ""}`} />
            <span>Refresh Desk</span>
          </button>
        </div>

        {/* Orders List */}
        {loading && partyOrdersList.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mx-auto mb-2" />
            <p>Loading bulk party inquiries...</p>
          </div>
        ) : partyOrdersList.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <p>No party inquiries received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {partyOrdersList.map((order) => {
              const isEditing = editingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4 hover:border-gray-700 transition"
                >
                  {/* Top line: ID, status, date */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl font-extrabold text-white">
                        {order.id}
                      </span>
                      <span
                        className={`text-xs font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${
                          order.status === "CONFIRMED"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-700/50"
                            : order.status === "REVIEWED"
                            ? "bg-amber-950 text-amber-300 border-amber-700/50"
                            : order.status === "REJECTED"
                            ? "bg-red-950 text-red-300 border-red-700/50"
                            : "bg-blue-950 text-blue-300 border-blue-700/50"
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">
                        Event Date: <strong className="text-white">{order.eventDate}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-gray-400 uppercase font-semibold block">Quotation (5% GST Incl.)</span>
                      <span className="font-mono text-xl font-extrabold text-amber-400">
                        ₹{order.estimatedBudget?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                    <div>
                      <div className="font-bold text-gray-400 uppercase text-[10px] mb-1">Customer & Scope</div>
                      <div className="font-bold text-white text-sm">{order.contactPerson}</div>
                      <div className="text-gray-400 font-mono mt-0.5">{order.contactPhone}</div>
                      <div className="text-amber-400 font-bold mt-1">
                        👥 {order.guestCount} Guests • {order.packageName}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-gray-400 uppercase text-[10px] mb-1">Assigned Kitchen Station</div>
                      <div className="text-white font-semibold">{order.outletName}</div>
                      <div className="text-gray-400 mt-1">
                        Special Notes: {order.customRequirements || "Standard royal packaging."}
                      </div>
                    </div>

                    <div>
                      <div className="font-bold text-gray-400 uppercase text-[10px] mb-1">Catering Manager Notes</div>
                      <div className="text-gray-300 italic bg-[#1b1e2a] p-2.5 rounded-lg border border-gray-800">
                        {order.cateringManagerNotes || "No manager notes added."}
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {order.status !== "CONFIRMED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "CONFIRMED")}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirm & Lock Degh</span>
                        </button>
                      )}

                      {order.status !== "REVIEWED" && order.status !== "CONFIRMED" && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, "REVIEWED")}
                          className="bg-[#242835] hover:bg-[#2d3343] text-amber-300 border border-gray-700 font-bold px-3 py-1.5 rounded-lg text-xs transition"
                        >
                          Mark Reviewed
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setEditingId(order.id);
                          setChefNotesInput(order.cateringManagerNotes || "");
                          setBudgetInput(order.estimatedBudget);
                          setOutletInput(order.assignedOutletId || "kondapur");
                        }}
                        className="bg-[#202330] hover:bg-[#282d3e] text-gray-300 border border-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition"
                      >
                        Adjust Quote / Hub
                      </button>
                    </div>

                    <div className="text-[11px] text-gray-400">
                      Submitted: {new Date(order.createdAt).toLocaleString()}
                    </div>
                  </div>

                  {/* Inline Adjustment Editor Modal */}
                  {isEditing && (
                    <div className="bg-[#12141c] p-4 rounded-xl border border-amber-500/40 space-y-3 mt-3">
                      <div className="font-bold text-xs text-amber-300 uppercase">
                        Adjust Quotation & Station Assignment for {order.id}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-gray-400 mb-1">Adjusted Budget Total (₹)</label>
                          <input
                            type="number"
                            value={budgetInput}
                            onChange={(e) => setBudgetInput(parseFloat(e.target.value) || 0)}
                            className="w-full bg-[#1e222e] border border-gray-700 rounded-lg p-2 text-white font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-gray-400 mb-1">Assign Cloud Kitchen / Outlet</label>
                          <select
                            value={outletInput}
                            onChange={(e) => setOutletInput(e.target.value)}
                            className="w-full bg-[#1e222e] border border-gray-700 rounded-lg p-2 text-white font-semibold"
                          >
                            {HYDERABAD_OUTLETS.map((o) => (
                              <option key={o.id} value={o.id}>
                                {o.name} ({o.locality})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-400 text-xs mb-1">Chef & Packaging Notes</label>
                        <input
                          type="text"
                          value={chefNotesInput}
                          onChange={(e) => setChefNotesInput(e.target.value)}
                          className="w-full bg-[#1e222e] border border-gray-700 rounded-lg p-2 text-xs text-white"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 rounded text-xs text-gray-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveAdjustments(order.id)}
                          className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-4 py-1 rounded text-xs transition"
                        >
                          Save Adjustments
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

