"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DEMO_USERS, HyderabadOutletSeed, HYDERABAD_OUTLETS } from "@/lib/constants";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  portionSize?: string;
  imageUrl?: string;
  isVeg?: number;
}

interface AppContextType {
  currentUser: any;
  setCurrentUser: (user: any) => void;
  selectedOutlet: HyderabadOutletSeed;
  setSelectedOutlet: (outlet: HyderabadOutletSeed) => void;
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  appliedCoupon: string;
  setAppliedCoupon: (code: string) => void;
  redeemedPoints: number;
  setRedeemedPoints: (pts: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(DEMO_USERS[0]); // Default to Amina Khan
  const [selectedOutlet, setSelectedOutlet] = useState<HyderabadOutletSeed>(HYDERABAD_OUTLETS[0]); // Default Kondapur
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [redeemedPoints, setRedeemedPoints] = useState<number>(0);

  // Load from localStorage if present
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("companyA_user");
      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      const savedOutlet = localStorage.getItem("companyA_outlet");
      if (savedOutlet) setSelectedOutlet(JSON.parse(savedOutlet));
      const savedCart = localStorage.getItem("companyA_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      // ignore
    }
  }, []);

  const handleSetUser = (user: any) => {
    setCurrentUser(user);
    try {
      localStorage.setItem("companyA_user", JSON.stringify(user));
    } catch (e) {}
  };

  const handleSetOutlet = (outlet: HyderabadOutletSeed) => {
    setSelectedOutlet(outlet);
    try {
      localStorage.setItem("companyA_outlet", JSON.stringify(outlet));
    } catch (e) {}
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      } else {
        updated = [...prev, item];
      }
      try {
        localStorage.setItem("companyA_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      try {
        localStorage.setItem("companyA_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const updated = prev
        .map((i) => {
          if (i.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
      try {
        localStorage.setItem("companyA_cart", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon("");
    setRedeemedPoints(0);
    try {
      localStorage.removeItem("companyA_cart");
    } catch (e) {}
  };

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetUser,
        selectedOutlet,
        setSelectedOutlet: handleSetOutlet,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        appliedCoupon,
        setAppliedCoupon,
        redeemedPoints,
        setRedeemedPoints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
