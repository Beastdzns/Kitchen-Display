import { GST_RATE, LOYALTY_REDEMPTION_MAX_PERCENT, LOYALTY_POINTS_EARN_PERCENT } from "../constants";

export interface CartItem {
  id: string;
  name: string;
  price: number; // Inclusive of 5% GST
  quantity: number;
}

export interface CouponRule {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
}

export const AVAILABLE_COUPONS: Record<string, CouponRule> = {
  DIRECT10: {
    code: "DIRECT10",
    description: "10% off on all direct orders (up to ₹150)",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 300,
    maxDiscount: 150,
  },
  HYDFIRST: {
    code: "HYDFIRST",
    description: "Flat ₹100 off on your first Hyderabad direct order",
    discountType: "FLAT",
    discountValue: 100,
    minOrderValue: 500,
  },
  NIZAM20: {
    code: "NIZAM20",
    description: "20% off on grand feasts over ₹1,500 (up to ₹350)",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 1500,
    maxDiscount: 350,
  },
};

export interface PricingCalculationResult {
  itemsSubtotal: number;
  itemCount: number;
  couponCode?: string;
  couponDiscount: number;
  loyaltyPointsRedeemed: number;
  loyaltyDiscount: number;
  totalDiscount: number;
  taxableAmount: number;
  gstAmount: number;
  deliveryFee: number;
  finalTotal: number;
  earnedLoyaltyPoints: number;
  gstLabel: string;
}

/**
 * Calculates compliant pricing, 5% inclusive GST breakdown, discounts,
 * loyalty redemption and points earned for Company A.
 */
export function calculateOrderPricing(
  items: CartItem[],
  couponCode?: string,
  requestedLoyaltyPoints: number = 0,
  userAvailableLoyaltyPoints: number = 0,
  isDelivery: boolean = true
): PricingCalculationResult {
  const itemsSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // 1. Coupon calculation
  let couponDiscount = 0;
  if (couponCode && AVAILABLE_COUPONS[couponCode.toUpperCase()]) {
    const coupon = AVAILABLE_COUPONS[couponCode.toUpperCase()];
    if (itemsSubtotal >= coupon.minOrderValue) {
      if (coupon.discountType === "PERCENTAGE") {
        const rawDiscount = (itemsSubtotal * coupon.discountValue) / 100;
        couponDiscount = coupon.maxDiscount ? Math.min(rawDiscount, coupon.maxDiscount) : rawDiscount;
      } else {
        couponDiscount = coupon.discountValue;
      }
    }
  }

  const subtotalAfterCoupon = Math.max(0, itemsSubtotal - couponDiscount);

  // 2. Loyalty points redemption (Constraint: max 20% of subtotal, 1 point = ₹1)
  const maxRedeemablePoints = Math.floor(subtotalAfterCoupon * LOYALTY_REDEMPTION_MAX_PERCENT);
  const eligiblePointsToRedeem = Math.min(
    requestedLoyaltyPoints,
    userAvailableLoyaltyPoints,
    maxRedeemablePoints
  );
  const loyaltyDiscount = eligiblePointsToRedeem; // 1 point = ₹1

  const totalDiscount = couponDiscount + loyaltyDiscount;
  const deliveryFee = isDelivery && itemsSubtotal < 500 && itemsSubtotal > 0 ? 40 : 0; // Free delivery over ₹500
  const finalTotal = Math.max(0, Math.round(itemsSubtotal - totalDiscount + deliveryFee));

  // 3. Statutory 5% GST Inclusive Breakdown
  // Total includes 5% GST -> GST component = Total * (0.05 / 1.05)
  const foodTotal = Math.max(0, finalTotal - deliveryFee);
  const gstAmount = Math.round(foodTotal * (GST_RATE / (1 + GST_RATE)));
  const taxableAmount = foodTotal - gstAmount;

  // 4. Earned points for direct order (5% of order value)
  const earnedLoyaltyPoints = Math.round(finalTotal * LOYALTY_POINTS_EARN_PERCENT);

  return {
    itemsSubtotal,
    itemCount,
    couponCode: couponDiscount > 0 ? couponCode?.toUpperCase() : undefined,
    couponDiscount: Math.round(couponDiscount),
    loyaltyPointsRedeemed: eligiblePointsToRedeem,
    loyaltyDiscount,
    totalDiscount: Math.round(totalDiscount),
    taxableAmount,
    gstAmount,
    deliveryFee,
    finalTotal,
    earnedLoyaltyPoints,
    gstLabel: "Inclusive of 5% GST (CGST 2.5% + SGST 2.5%)",
  };
}

