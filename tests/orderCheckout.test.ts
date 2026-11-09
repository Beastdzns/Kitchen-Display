import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { orders, orderItems, users, auditNotifications, loyaltyLedger } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { calculateOrderPricing } from "../src/lib/pricing/calculator";

describe("Direct Order Checkout & DPDP Compliance", () => {
  it("should calculate correct billing for a multi-item order with coupon and loyalty points", () => {
    const items = [
      { id: "chk-dum-biryani-family", name: "Chicken Dum Biryani (Family Pack)", price: 890, quantity: 1 },
      { id: "double-ka-meetha", name: "Shahi Double Ka Meetha", price: 145, quantity: 2 },
    ]; // Subtotal = 1180

    // Test with coupon DIRECT10 (10% off = 118) and 100 loyalty points
    const pricing = calculateOrderPricing(items, "DIRECT10", 100, 340, true);

    expect(pricing.itemsSubtotal).toBe(1180);
    expect(pricing.couponDiscount).toBe(118);
    expect(pricing.loyaltyDiscount).toBe(100);
    expect(pricing.finalTotal).toBe(1180 - 118 - 100); // 962
    expect(pricing.gstAmount).toBe(Math.round(962 * (0.05 / 1.05))); // 46
  });

  it("should enforce DPDP Act 2023 opt-in persistence on users", () => {
    // Check that demo user Amina has dpdpMarketingOptIn recorded
    const amina = db.select().from(users).where(eq(users.id, "cust-amina")).get();
    expect(amina).toBeDefined();
    expect(amina?.dpdpMarketingOptIn).toBe(1);
  });

  it("should accurately maintain loyalty points ledger", () => {
    const ledgers = db.select().from(loyaltyLedger).where(eq(loyaltyLedger.userId, "cust-amina")).all();
    expect(ledgers.length).toBeGreaterThan(0);
    const sumPoints = ledgers.reduce((sum, l) => sum + l.pointsChange, 0);
    expect(sumPoints).toBeGreaterThan(0);
  });
});
