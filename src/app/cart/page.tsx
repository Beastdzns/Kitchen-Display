"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { calculateOrderPricing, AVAILABLE_COUPONS } from "@/lib/pricing/calculator";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Sparkles,
  ShieldCheck,
  QrCode,
  CreditCard,
  CheckCircle2,
  Tag,
  ArrowRight,
  MapPin,
  Lock,
  Flame,
} from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    selectedOutlet,
    currentUser,
    appliedCoupon,
    setAppliedCoupon,
    redeemedPoints,
    setRedeemedPoints,
  } = useApp();

  const [couponInput, setCouponInput] = useState<string>(appliedCoupon || "");
  const [couponError, setCouponError] = useState<string>("");
  const [deliveryAddress, setDeliveryAddress] = useState<string>(
    "Demo address, Kondapur, Hyderabad"
  );
  const [customerNotes, setCustomerNotes] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "CARD">("UPI");
  const [dpdpConsent, setDpdpConsent] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [testUpiSuccess, setTestUpiSuccess] = useState<boolean>(true);

  // Calculate pricing
  const availablePoints = currentUser?.loyaltyPoints || 340;
  const pricing = calculateOrderPricing(
    cart,
    appliedCoupon,
    redeemedPoints,
    availablePoints,
    true
  );

  const handleApplyCoupon = (code: string) => {
    const clean = code.toUpperCase().trim();
    if (!AVAILABLE_COUPONS[clean]) {
      setCouponError("Invalid coupon code. Try DIRECT10 or HYDFIRST.");
      return;
    }
    const rule = AVAILABLE_COUPONS[clean];
    if (pricing.itemsSubtotal < rule.minOrderValue) {
      setCouponError(`Min order value of ₹${rule.minOrderValue} required for ${clean}`);
      return;
    }
    setCouponError("");
    setAppliedCoupon(clean);
  };

  const handleApplyMaxLoyalty = () => {
    // 20% max of subtotal
    const maxRedeemable = Math.floor(pricing.itemsSubtotal * 0.2);
    const eligible = Math.min(availablePoints, maxRedeemable);
    setRedeemedPoints(eligible);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    if (!dpdpConsent) {
      alert("Please accept the DPDP Act 2023 consent to receive order updates.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: currentUser.id,
          outletId: selectedOutlet.id,
          orderType: "DELIVERY",
          items: cart,
          couponCode: appliedCoupon || undefined,
          redeemedPoints: pricing.loyaltyPointsRedeemed,
          paymentMethod,
          deliveryAddress,
          customerNotes,
          dpdpConsent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.orderId) {
        clearCart();
        router.push(`/order/${data.orderId}`);
      } else {
        alert(data.error || "Failed to place order");
      }
    } catch (err: any) {
      console.error("Order submission failed:", err);
      alert("Network error placing order. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
        <div className="w-20 h-20 rounded-full bg-[#1b1e2a] border border-gray-800 flex items-center justify-center text-amber-500 mb-4 shadow-xl">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-white">Your Feast Cart is Empty</h2>
        <p className="text-gray-400 text-xs mt-1 max-w-sm">
          Fresh dum handis are simmering at {selectedOutlet.name}. Add your favorite biryani and desserts.
        </p>
        <Link
          href="/menu"
          className="mt-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 text-xs transition"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-diwali-pattern text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-amber-500/40">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
              <span>🪔</span>
              <span>Diwali Direct Checkout • Exclusive 5% Cashback</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
              Direct Order Checkout
            </h1>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
              <span>Delivering from: <strong className="text-amber-300">{selectedOutlet.name}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">FSSAI #{selectedOutlet.fssaiNumber}</span>
              <span>•</span>
              <span>Target: Sub-60s Checkout</span>
            </p>
          </div>

          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items & Delivery Details (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Items Card */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>Your Selected Items ({cart.length})</span>
                <span className="text-xs font-normal text-amber-400 font-mono">5% GST Included</span>
              </h3>

              <div className="divide-y divide-gray-800/80">
                {cart.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-white text-sm">{item.name}</div>
                      {item.portionSize && (
                        <div className="text-xs text-amber-400/90 font-medium">{item.portionSize}</div>
                      )}
                      <div className="text-xs font-mono text-gray-400 mt-1">₹{item.price} each</div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 bg-[#202432] border border-gray-700 px-2.5 py-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-amber-400 hover:text-white p-0.5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-mono font-bold text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-amber-400 hover:text-white p-0.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right font-mono font-bold text-white text-sm min-w-16">
                      ₹{item.price * item.quantity}
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address & Notes Card */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>Delivery Location in Hyderabad</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Full Street Address & Landmark
                </label>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-1">
                  Cooking / Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra raita, mild spice, leave at security"
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  className="w-full bg-[#202432] border border-gray-700 rounded-xl px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* DPDP Act 2023 Compliance Checkbox (Constraint) */}
            <div className="bg-[#151722] border border-amber-500/30 rounded-2xl p-4 shadow-xl">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dpdpConsent}
                  onChange={(e) => setDpdpConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-amber-500 bg-[#202432] border-gray-700 focus:ring-0 cursor-pointer"
                />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong className="text-white">DPDP Act 2023 Consent:</strong> I agree to receive live order progress updates via WhatsApp & SMS, and consent to direct rewards communication under the Digital Personal Data Protection Act 2023. We never sell your personal data.
                </div>
              </label>
            </div>
          </div>

          {/* Right Column: Pricing, Coupons, Loyalty & Payment (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Loyalty Points Redemption Box */}
            <div className="bg-gradient-to-br from-[#1c1f2c] to-[#151720] border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Direct Loyalty Points
                  </span>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                  Balance: {availablePoints} pts (₹{availablePoints})
                </span>
              </div>

              <p className="text-xs text-gray-400 leading-relaxed">
                Direct orders earn 5% cashback. Redeem up to 20% (₹{Math.floor(pricing.itemsSubtotal * 0.2)}) on this feast.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyMaxLoyalty}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                    pricing.loyaltyPointsRedeemed > 0
                      ? "bg-amber-500 text-black border-amber-500 shadow-md"
                      : "bg-[#252936] hover:bg-[#2d3242] text-amber-300 border-gray-700"
                  }`}
                >
                  {pricing.loyaltyPointsRedeemed > 0
                    ? `Redeemed ₹${pricing.loyaltyPointsRedeemed}`
                    : `Redeem Max (₹${Math.floor(pricing.itemsSubtotal * 0.2)})`}
                </button>

                {pricing.loyaltyPointsRedeemed > 0 && (
                  <button
                    onClick={() => setRedeemedPoints(0)}
                    className="text-xs text-gray-400 hover:text-red-400 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Coupons Card */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-300">
                <Tag className="w-4 h-4 text-amber-500" />
                <span>Apply Coupon</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code (DIRECT10, HYDFIRST)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-[#202432] border border-gray-700 rounded-xl px-3 py-2 text-xs text-white uppercase placeholder-gray-500 font-mono focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => handleApplyCoupon(couponInput)}
                  className="bg-[#262b3a] hover:bg-[#303648] text-amber-300 px-4 py-2 rounded-xl text-xs font-bold border border-gray-700 transition"
                >
                  Apply
                </button>
              </div>

              {couponError && <p className="text-[11px] text-red-400">{couponError}</p>}

              {/* Quick 1-click test coupons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleApplyCoupon("DIWALI20")}
                  className="text-[10px] bg-gradient-to-r from-red-950 to-amber-950 hover:from-red-900 hover:to-amber-900 text-amber-300 px-2.5 py-1 rounded-md border border-amber-500/50 font-mono font-bold flex items-center gap-1 shadow-sm"
                >
                  <span>🪔</span> + DIWALI20 (20% off)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon("DIRECT10")}
                  className="text-[10px] bg-[#1e222e] hover:bg-[#252b3a] text-gray-300 px-2 py-1 rounded-md border border-gray-700 font-mono"
                >
                  + DIRECT10 (10% off)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyCoupon("HYDFIRST")}
                  className="text-[10px] bg-[#1e222e] hover:bg-[#252b3a] text-gray-300 px-2 py-1 rounded-md border border-gray-700 font-mono"
                >
                  + HYDFIRST (₹100 off)
                </button>
              </div>
            </div>

            {/* Bill Summary Breakdown (Statutory 5% GST Included) */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-3 font-mono text-xs">
              <h3 className="font-sans font-bold uppercase tracking-wider text-gray-300 text-sm pb-2 border-b border-gray-800">
                Bill Summary
              </h3>

              <div className="flex items-center justify-between text-gray-300">
                <span>Items Subtotal:</span>
                <span>₹{pricing.itemsSubtotal}</span>
              </div>

              {pricing.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span>Coupon Discount ({pricing.couponCode}):</span>
                  <span>-₹{pricing.couponDiscount}</span>
                </div>
              )}

              {pricing.loyaltyDiscount > 0 && (
                <div className="flex items-center justify-between text-amber-400">
                  <span>Loyalty Points Redeemed:</span>
                  <span>-₹{pricing.loyaltyDiscount}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-gray-300">
                <span>Delivery Partner Fee:</span>
                <span>{pricing.deliveryFee === 0 ? "FREE" : `₹${pricing.deliveryFee}`}</span>
              </div>

              {/* Statutory 5% GST Disclosure */}
              <div className="bg-[#12141a] p-3 rounded-xl border border-gray-800 text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Taxable Food Base:</span>
                  <span>₹{pricing.taxableAmount}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                  <span>Inclusive 5% GST (CGST 2.5% + SGST 2.5%):</span>
                  <span>₹{pricing.gstAmount}</span>
                </div>
                <div className="text-[10px] text-gray-400 italic">
                  *All menu items are inclusive of 5% Goods and Services Tax.
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-base font-bold text-white">
                <span>To Pay:</span>
                <span className="text-xl text-amber-400 font-extrabold">₹{pricing.finalTotal}</span>
              </div>

              <div className="bg-emerald-950/40 border border-emerald-600/30 p-2.5 rounded-xl text-emerald-300 text-center text-[11px] font-sans font-medium">
                🎉 Direct Order Reward: You will earn <strong>+{pricing.earnedLoyaltyPoints} loyalty points</strong> upon delivery!
              </div>
            </div>

            {/* Test Payment Selector */}
            <div className="bg-[#161822] border border-gray-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
                <span>Payment Mode (Test Mode)</span>
                <span className="text-[10px] font-mono bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800">
                  SANDBOX MOCK
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("UPI")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === "UPI"
                      ? "bg-amber-500/10 border-amber-500 text-white"
                      : "bg-[#202432] border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("CARD")}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                    paymentMethod === "CARD"
                      ? "bg-amber-500/10 border-amber-500 text-white"
                      : "bg-[#202432] border-gray-700 text-gray-400 hover:text-white"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold">Debit / Card</span>
                </button>
              </div>

              {/* UPI Simulated Details */}
              {paymentMethod === "UPI" ? (
                <div className="bg-[#12141a] p-3 rounded-xl border border-gray-800 text-center text-xs space-y-2">
                  <div className="text-[11px] text-gray-400">Scan via GPay / PhonePe / Paytm</div>
                  <div className="w-24 h-24 bg-white p-2 rounded-xl mx-auto shadow-md flex items-center justify-center">
                    {/* Simulated QR Code Graphic */}
                    <div className="w-full h-full bg-black rounded flex items-center justify-center text-white text-[9px] font-mono text-center font-bold">
                      UPI QR ₹{pricing.finalTotal}
                    </div>
                  </div>
                  <div className="font-mono text-[11px] text-amber-300">VPA: companya@icici</div>
                </div>
              ) : (
                <div className="bg-[#12141a] p-3 rounded-xl border border-gray-800 text-xs space-y-2 font-mono">
                  <div className="text-gray-400 text-[10px]">Test Card Pre-Filled:</div>
                  <div className="text-white font-bold tracking-wider">4242 •••• •••• 4242</div>
                  <div className="text-[11px] text-gray-400 flex justify-between">
                    <span>EXP: 12/28</span>
                    <span>CVV: 888</span>
                  </div>
                </div>
              )}
            </div>

            {/* Place Order CTA Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={submitting}
              className={`w-full py-4 px-6 rounded-2xl font-extrabold uppercase tracking-wide flex items-center justify-center gap-2 text-base transition shadow-2xl ${
                submitting
                  ? "bg-gray-800 text-gray-400 cursor-wait"
                  : "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black shadow-amber-500/20 active:scale-98"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>
                {submitting ? "Placing Order Directly..." : `Place Order (₹${pricing.finalTotal})`}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
