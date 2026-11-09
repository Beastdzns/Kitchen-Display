import { describe, it, expect } from "vitest";
import { calculateOrderPricing } from "../src/lib/pricing/calculator";

describe("Pricing, Inclusive 5% GST & Loyalty Engine", () => {
  const sampleItems = [
    { id: "chk-dum-biryani-family", name: "Chicken Dum Biryani (Family Pack)", price: 890, quantity: 1 },
    { id: "double-ka-meetha", name: "Shahi Double Ka Meetha", price: 145, quantity: 2 },
  ]; // Total = 890 + 290 = 1180 (Exact sample order WEB-778120)

  it("should calculate exact subtotal for sample order WEB-778120 (₹1,180)", () => {
    const pricing = calculateOrderPricing(sampleItems);
    expect(pricing.itemsSubtotal).toBe(1180);
    expect(pricing.finalTotal).toBe(1180);
  });

  it("should accurately compute 5% inclusive GST (Total * 5/105)", () => {
    const pricing = calculateOrderPricing(sampleItems);
    // 1180 * (0.05 / 1.05) = 56.19 -> rounded to 56
    expect(pricing.gstAmount).toBe(56);
    expect(pricing.taxableAmount).toBe(1180 - 56);
    expect(pricing.gstLabel).toContain("Inclusive of 5% GST");
  });

  it("should apply coupon DIRECT10 with 10% discount capped at ₹150", () => {
    const pricing = calculateOrderPricing(sampleItems, "DIRECT10");
    // 10% of 1180 = 118
    expect(pricing.couponDiscount).toBe(118);
    expect(pricing.finalTotal).toBe(1180 - 118);
  });

  it("should enforce loyalty points redemption limit to maximum 20% of subtotal", () => {
    // Subtotal 1180 -> 20% is 236 points max
    const userWithExcessPoints = 500;
    const requestedPoints = 500;

    const pricing = calculateOrderPricing(sampleItems, undefined, requestedPoints, userWithExcessPoints);
    expect(pricing.loyaltyPointsRedeemed).toBe(236);
    expect(pricing.loyaltyDiscount).toBe(236);
    expect(pricing.finalTotal).toBe(1180 - 236);
  });

  it("should credit 5% loyalty points on direct order total", () => {
    const pricing = calculateOrderPricing(sampleItems);
    // 5% of 1180 = 59 points
    expect(pricing.earnedLoyaltyPoints).toBe(59);
  });
});
