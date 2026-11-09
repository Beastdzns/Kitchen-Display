"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { getSocketClient } from "@/lib/socket/client";
import { generateReorderSuggestions, ReorderSuggestion } from "@/lib/ai/reorderEngine";
import {
  Flame,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ShoppingBag,
  Check,
  Search,
  Filter,
  Gift,
  Tag,
} from "lucide-react";
import Link from "next/link";

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  basePrice: number;
  price: number;
  portionSize: string;
  imageUrl: string;
  isVeg: number;
  spiceLevel: "MILD" | "MEDIUM" | "DUM_SPICY";
  allergensList: string[];
  isAvailable: boolean;
  basePrepTimeMinutes: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export default function MenuPage() {
  const { selectedOutlet, cart, addToCart, updateQuantity, cartCount, cartTotal, currentUser, setAppliedCoupon } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiSuggestions, setAiSuggestions] = useState<ReorderSuggestion[]>([]);

  // Fetch menu for selected outlet
  const fetchMenu = async (outletId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/menu?outletId=${outletId}`);
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
      if (data.items) setItems(data.items);
    } catch (err) {
      console.error("Failed fetching menu:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu(selectedOutlet.id);

    // AI Reorder Suggestions calculation for current user
    const pastOrders = [
      {
        placedAt: "2026-11-01T20:14:00",
        items: [
          { menuItemId: "chk-dum-biryani-family", itemName: "Chicken Dum Biryani (Family Pack)", quantity: 2 },
          { menuItemId: "double-ka-meetha", itemName: "Shahi Double Ka Meetha", quantity: 2 },
        ],
      },
      {
        placedAt: "2026-11-04T20:30:00",
        items: [
          { menuItemId: "chk-dum-biryani-family", itemName: "Chicken Dum Biryani (Family Pack)", quantity: 1 },
        ],
      },
    ];

    const suggestions = generateReorderSuggestions(pastOrders, new Date());
    setAiSuggestions(suggestions);

    // Real-time 86-ing listener from Socket.io
    const socket = getSocketClient();
    const handle86Change = (payload: { outletId: string; menuItemId: string; isAvailable: number }) => {
      if (payload.outletId === selectedOutlet.id) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === payload.menuItemId
              ? { ...item, isAvailable: payload.isAvailable === 1 }
              : item
          )
        );
      }
    };

    socket.on("menu:item_availability_changed", handle86Change);
    return () => {
      socket.off("menu:item_availability_changed", handle86Change);
    };
  }, [selectedOutlet.id]);

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = activeCategory === "all" || item.categoryId === activeCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = vegOnly ? item.isVeg === 1 : true;
    return matchesCat && matchesSearch && matchesVeg;
  });

  // Helper to get quantity in cart
  const getItemQuantity = (itemId: string) => {
    const match = cart.find((i) => i.id === itemId);
    return match ? match.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col bg-diwali-pattern text-gray-100 min-h-screen">
      {/* Top Menu Banner & Outlet Info with Diwali Amber Styling */}
      <div className="bg-[#150d1d] border-b-2 border-amber-500/40 px-4 sm:px-6 lg:px-8 py-6 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              <span className="text-base diya-glow">🪔</span>
              <span>Diwali Festive Feast • Direct From Degh</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Hyderabad Royal Menu & Shahi Mithai
            </h1>
            <p className="text-xs text-gray-400 mt-1 flex flex-wrap items-center gap-2">
              <span>Delivering from: <strong className="text-amber-300">{selectedOutlet.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">FSSAI #{selectedOutlet.fssaiNumber}</span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">All prices inclusive of 5% GST</span>
            </p>
          </div>

          {/* Search, Veg Filter, and Diwali Coupon Pill */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search biryani, mithai..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#231530] border border-gray-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                vegOnly
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-md"
                  : "bg-[#231530] text-gray-400 border-gray-700/80 hover:text-white"
              }`}
            >
              <span className="w-3.5 h-3.5 rounded-full border border-emerald-500 flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </span>
              <span>Veg Only</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Diwali Festive Dawat Promotion Banner */}
        <div className="bg-gradient-to-r from-red-950/60 via-amber-950/60 to-orange-950/60 border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/40 text-2xl diya-glow">
              🪔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base font-bold text-white">
                  Shubh Deepavali Special Offer
                </h3>
                <span className="text-[10px] uppercase font-mono font-extrabold bg-red-600/40 text-red-200 px-2 py-0.5 rounded border border-red-500/40">
                  Flat 20% Off
                </span>
              </div>
              <p className="text-xs text-gray-300 mt-0.5">
                Apply coupon <strong className="text-amber-300 font-mono">DIWALI20</strong> at checkout for 20% off on all royal handis & Shahi mithai!
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setAppliedCoupon("DIWALI20");
              alert("Coupon DIWALI20 applied! You will receive 20% off at checkout.");
            }}
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-md shadow-amber-500/20 shrink-0"
          >
            Apply DIWALI20
          </button>
        </div>

        {/* AI "Order Again" Personalization Section (Guardrail: Never auto-adds to cart) */}
        {aiSuggestions.length > 0 && !searchQuery && (
          <section className="bg-gradient-to-r from-[#1c1228] via-[#160d20] to-[#1c1228] border-2 border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI Reorder Suggestions for {currentUser.name.split(" ")[0]}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Calculated from your past dinner frequencies & taste history.
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-black/40 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/30 font-semibold">
                Guardrail: Click Add to select
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {aiSuggestions.map((sug) => {
                const menuItem = items.find((i) => i.id === sug.menuItemId);
                if (!menuItem) return null;
                const qty = getItemQuantity(menuItem.id);

                return (
                  <div
                    key={sug.menuItemId}
                    className="bg-[#241733] border border-amber-500/30 hover:border-amber-400 p-4 rounded-xl flex items-center justify-between gap-3 transition shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {sug.badgeText}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">
                          {Math.round(sug.confidenceScore * 100)}% match
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white leading-tight">{sug.itemName}</div>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1">{sug.reason}</p>
                      <div className="text-xs font-mono font-bold text-amber-300 mt-2">
                        ₹{menuItem.price}{" "}
                        <span className="text-[10px] font-normal text-gray-400">(Incl. GST)</span>
                      </div>
                    </div>

                    {/* Add / Qty Controller */}
                    <div>
                      {qty === 0 ? (
                        <button
                          onClick={() =>
                            addToCart({
                              id: menuItem.id,
                              name: menuItem.name,
                              price: menuItem.price,
                              quantity: 1,
                              portionSize: menuItem.portionSize,
                              imageUrl: menuItem.imageUrl,
                              isVeg: menuItem.isVeg,
                            })
                          }
                          disabled={!menuItem.isAvailable}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-md ${
                            menuItem.isAvailable
                              ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-amber-500/20"
                              : "bg-gray-800 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{menuItem.isAvailable ? "Add" : "Paused"}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#170f22] border border-amber-500/60 px-2 py-1 rounded-lg">
                          <button
                            onClick={() => updateQuantity(menuItem.id, -1)}
                            className="text-amber-400 hover:text-white p-0.5"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-mono font-bold text-white w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(menuItem.id, 1)}
                            className="text-amber-400 hover:text-white p-0.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Category Navigation Pills with Clear Demarcations & Active Glow */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b-2 border-gray-800">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition border ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-300 shadow-md shadow-amber-500/30"
                : "bg-[#1c1226] text-gray-300 hover:text-white hover:bg-[#281a38] border-gray-700/80"
            }`}
          >
            All Royal Dishes ({items.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition border ${
                activeCategory === c.id
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black border-amber-300 shadow-md shadow-amber-500/30"
                  : "bg-[#1c1226] text-gray-300 hover:text-white hover:bg-[#281a38] border-gray-700/80"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Food Items Grid (Hunger-inducing big photos, minimal clean typography, gold borders) */}
        {loading ? (
          <div className="py-24 text-center text-gray-500">
            <Flame className="w-8 h-8 animate-bounce text-amber-500 mx-auto mb-2" />
            <p>Loading authentic Hyderabadi menu...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-24 text-center text-gray-500">
            <p>No dishes match your selection. Try clearing filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => {
              const qty = getItemQuantity(item.id);
              const is86 = !item.isAvailable;
              const isFestiveMithai = item.categoryId === "desserts";

              return (
                <div
                  key={item.id}
                  className={`bg-[#170f22] border-2 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-xl ${
                    is86
                      ? "border-red-900/40 opacity-70"
                      : isFestiveMithai
                      ? "border-amber-400/60 shadow-amber-500/15"
                      : "border-gray-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/5"
                  }`}
                >
                  {/* Food Photo Container */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-900">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className={`w-full h-full object-cover transition duration-500 ${
                        is86 ? "grayscale contrast-75" : "hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Veg / Non-Veg Badge */}
                    <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md p-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                      <div
                        className={`w-3.5 h-3.5 border-2 flex items-center justify-center p-0.5 ${
                          item.isVeg ? "border-emerald-500" : "border-red-500"
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-200 uppercase font-mono">
                        {item.isVeg ? "Veg" : "Non-Veg"}
                      </span>
                    </div>

                    {/* Festive Sweet or Spice Level Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {isFestiveMithai && (
                        <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] font-extrabold uppercase tracking-wider px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                          <span>🪔</span> Festive Mithai
                        </span>
                      )}
                      <span className="bg-black/75 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border border-white/10 text-amber-300">
                        {item.spiceLevel === "DUM_SPICY" ? "🔥 Dum Spicy" : item.spiceLevel}
                      </span>
                    </div>

                    {/* 86-ed Overlay Banner */}
                    {is86 && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="bg-red-600 text-white font-extrabold uppercase tracking-wider text-xs px-3 py-1.5 rounded-lg shadow-lg">
                          Sold Out at {selectedOutlet.locality}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-serif font-bold text-lg text-white leading-tight">
                          {item.name}
                        </h3>
                      </div>
                      <div className="text-xs text-amber-400 font-medium mt-1">
                        {item.portionSize}
                      </div>
                      <p className="text-xs text-gray-300 mt-2 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>

                      {/* Allergens warning */}
                      {item.allergensList.length > 0 && (
                        <div className="text-[10px] text-gray-400 mt-2 flex items-center gap-1">
                          <span>Contains:</span>
                          <span className="text-gray-300 font-medium">
                            {item.allergensList.join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price & Action Row with Clear Demarcations */}
                    <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-mono font-extrabold text-white">
                          ₹{item.price}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          Inclusive of 5% GST
                        </div>
                      </div>

                      {/* Add Button / Counter */}
                      <div>
                        {qty === 0 ? (
                          <button
                            onClick={() =>
                              addToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                                quantity: 1,
                                portionSize: item.portionSize,
                                imageUrl: item.imageUrl,
                                isVeg: item.isVeg,
                              })
                            }
                            disabled={is86}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wide transition flex items-center gap-1.5 shadow-md ${
                              !is86
                                ? "bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black shadow-amber-500/20 active:scale-95"
                                : "bg-gray-800 text-gray-500 cursor-not-allowed"
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            <span>{!is86 ? "Add to Dawat" : "Unavailable"}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-[#231530] border-2 border-amber-400 px-3 py-1.5 rounded-xl shadow-lg">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="text-amber-400 hover:text-white p-0.5 active:scale-90"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-mono font-bold text-white min-w-4 text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="text-amber-400 hover:text-white p-0.5 active:scale-90"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar for Instant <60s Checkout */}
      {cartCount > 0 && (
        <div className="sticky bottom-0 z-40 bg-[#160d21]/95 backdrop-blur-md border-t-2 border-amber-500/40 p-4 shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-gray-300">
                <strong className="text-white font-mono text-sm">{cartCount} items</strong> in your Diwali dawat
              </div>
              <div className="text-lg font-mono font-extrabold text-amber-300">
                ₹{cartTotal} <span className="text-xs font-normal text-gray-400">(Inclusive of 5% GST)</span>
              </div>
            </div>

            <Link
              href="/cart"
              className="bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-black font-extrabold px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl shadow-amber-500/30 text-sm transition transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
