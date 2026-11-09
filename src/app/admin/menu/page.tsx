"use client";

import React, { useEffect, useState } from "react";
import { HYDERABAD_OUTLETS, HyderabadOutletSeed } from "@/lib/constants";
import { getSocketClient } from "@/lib/socket/client";
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Flame,
  Tag,
  DollarSign,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function CentralMenuCMSPage() {
  const [selectedOutletId, setSelectedOutletId] = useState<string>("kondapur");
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [timeFilter, setTimeFilter] = useState<string>("ALL");
  const [editingPriceItem, setEditingPriceItem] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<string>("");

  const currentOutlet =
    HYDERABAD_OUTLETS.find((o) => o.id === selectedOutletId) || HYDERABAD_OUTLETS[0];

  const fetchMenu = async (outletId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/menu?outletId=${outletId}`);
      const data = await res.json();
      if (data.items) setItems(data.items);
      if (data.categories) setCategories(data.categories);
    } catch (err) {
      console.error("Failed fetching CMS menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedOutletId);
  }, [selectedOutletId]);

  // Toggle 86ing (Out of Stock)
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
      setItems((prev) =>
        prev.map((i) => (i.id === menuItemId ? { ...i, isAvailable: nextVal === 1 } : i))
      );
    } catch (err) {
      console.error("Failed toggling 86:", err);
    }
  };

  const filtered = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchesTime = timeFilter === "ALL" || item.timeSlot === timeFilter;
    return matchesSearch && matchesTime;
  });

  const pausedCount = items.filter((i) => !i.isAvailable).length;

  return (
    <div className="flex-1 bg-[#0e1014] text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>Central Marketing & Culinary Admin</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-white">
              Central Menu CMS & 86-ing Desk
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Control pricing, pause out-of-stock deghs, and manage time-based menus across 17 Hyderabad locations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="bg-[#1e222d] hover:bg-[#282d3b] text-gray-200 border border-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition"
            >
              Analytics Dashboard
            </Link>
            <Link
              href="/kds"
              className="bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-amber-500/20"
            >
              Open Kitchen KDS
            </Link>
          </div>
        </div>

        {/* Outlet Selector & Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Managing Outlet / Kitchen Station:
            </label>
            <select
              value={selectedOutletId}
              onChange={(e) => setSelectedOutletId(e.target.value)}
              className="w-full bg-[#202432] text-white border border-gray-700 rounded-xl px-4 py-2.5 font-bold text-sm focus:outline-none focus:border-amber-500"
            >
              {HYDERABAD_OUTLETS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name} ({o.type === "CLOUD_KITCHEN" ? "Cloud Kitchen" : "Dine-In Hub"})
                </option>
              ))}
            </select>
            <div className="mt-3 text-xs text-gray-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                <ShieldCheck className="w-3.5 h-3.5" /> FSSAI Lic. #{currentOutlet.fssaiNumber}
              </span>
              <span>Coverage: {currentOutlet.deliveryRadiusKm} km</span>
            </div>
          </div>

          <div className="bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Menu Dishes</div>
            <div className="text-3xl font-mono font-extrabold text-white mt-1">{items.length}</div>
            <div className="text-xs text-emerald-400 mt-2 font-medium">All prices inclusive of 5% GST</div>
          </div>

          <div className="bg-[#161822] border border-gray-800 p-5 rounded-2xl shadow-xl">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Currently Paused (86'd)</div>
            <div className="text-3xl font-mono font-extrabold text-amber-400 mt-1">{pausedCount}</div>
            <div className="text-xs text-gray-400 mt-2">Instantly syncs with active customer screens</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#161822] p-4 rounded-2xl border border-gray-800">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {["ALL", "ALL_DAY", "LUNCH", "DINNER", "LATE_NIGHT"].map((slot) => {
              const active = timeFilter === slot;
              const labels: Record<string, string> = {
                ALL: "All Schedules",
                ALL_DAY: "All-Day Menu",
                LUNCH: "Lunch (11am-4pm)",
                DINNER: "Dinner (6pm-11pm)",
                LATE_NIGHT: "Late Night Dum (11pm-2am)",
              };
              return (
                <button
                  key={slot}
                  onClick={() => setTimeFilter(slot)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                    active ? "bg-amber-500 text-black shadow-md" : "bg-[#202432] text-gray-300 hover:bg-[#2a3042]"
                  }`}
                >
                  {labels[slot]}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search items by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#202432] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* CMS Items Table */}
        <div className="bg-[#161822] border border-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1b1e2a] text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-800">
                <tr>
                  <th className="py-3.5 px-4">Dish Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Base Price (5% GST)</th>
                  <th className="py-3.5 px-4">Spice & Allergens</th>
                  <th className="py-3.5 px-4">Prep Path</th>
                  <th className="py-3.5 px-4 text-center">Outlet Availability (86)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/80">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#1a1d28] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-900 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{item.name}</div>
                          <div className="text-[11px] text-amber-400/90">{item.portionSize}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 uppercase font-mono text-gray-300">
                      {item.categoryId}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white text-sm">
                      ₹{item.price}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-amber-400">
                          {item.spiceLevel}
                        </span>
                        {item.allergensList.length > 0 && (
                          <span className="text-[10px] text-gray-400">
                            {item.allergensList.join(", ")}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      ~{item.basePrepTimeMinutes}m degh base
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggle86(item.id, item.isAvailable)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition inline-flex items-center gap-1.5 shadow-md ${
                          item.isAvailable
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-600/40 hover:bg-emerald-900"
                            : "bg-red-950/80 text-red-400 border border-red-600/40 hover:bg-red-900"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FSSAI Statutory License Directory */}
        <div className="bg-[#161822] border border-gray-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Official FSSAI Licensing Directory (14 Outlets & 3 Cloud Kitchens)
            </h3>
          </div>
          <p className="text-xs text-gray-400">
            Mandatory disclosure under the Food Safety and Standards Authority of India (FSSAI) regulations. Displayed on every outlet receipt.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {HYDERABAD_OUTLETS.map((o) => (
              <div
                key={o.id}
                className="bg-[#1f222e] p-3 rounded-xl border border-gray-800 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-gray-200">{o.name}</div>
                  <div className="text-[10px] text-gray-400">{o.locality}</div>
                </div>
                <div className="text-right font-mono text-emerald-400 font-semibold text-[11px]">
                  #{o.fssaiNumber}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
