import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { partyOrders, orders, outlets } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import { PARTY_ORDER_MIN_GUESTS, PARTY_ORDER_MIN_NOTICE_HOURS } from "../src/lib/constants";

describe("Catering Constraints & Business Analytics Model", () => {
  it("should have pre-seeded sample party order PARTY-9021 for 40 guests", () => {
    const party = db.select().from(partyOrders).where(eq(partyOrders.id, "PARTY-9021")).get();
    expect(party).toBeDefined();
    expect(party?.guestCount).toBe(40);
    expect(party?.guestCount).toBeGreaterThanOrEqual(PARTY_ORDER_MIN_GUESTS);
    expect(party?.packageName).toContain("Nizami");
  });

  it("should enforce minimum 15 pax and 24h advance notice rules", () => {
    expect(PARTY_ORDER_MIN_GUESTS).toBe(15);
    expect(PARTY_ORDER_MIN_NOTICE_HOURS).toBe(24);
  });

  it("should verify 15% net commission savings arithmetic", () => {
    // Delivery apps charge 27% average
    // Direct payment & delivery cost is 12%
    // Net bottom-line savings = 27% - 12% = 15 points
    const appCommissionRate = 0.27;
    const directCostRate = 0.12;
    const netSavingsRate = appCommissionRate - directCostRate;

    expect(netSavingsRate).toBeCloseTo(0.15, 5);

    // Brief model check: ₹52.8 Cr app sales * 12% shift = ₹6.336 Cr
    const shiftedVolume = 52.8 * 0.12;
    expect(shiftedVolume).toBeCloseTo(6.336, 3);

    // 15% of ₹6.336 Cr = ₹95.04 Lakh
    const directSavingsLakh = shiftedVolume * 0.15 * 100;
    expect(directSavingsLakh).toBeCloseTo(95.04, 2);

    // Bulk phone line recovery: 30 orders/mo * ₹18,000 * 30% margin * 12 months = ₹19.44 Lakh
    const bulkSavingsLakh = (30 * 18000 * 0.3 * 12) / 100000;
    expect(bulkSavingsLakh).toBeCloseTo(19.44, 2);

    // Total = 95.04 + 19.44 = ₹1.1448 Cr ~ ₹1.14 Cr
    const totalCr = (directSavingsLakh + bulkSavingsLakh) / 100;
    expect(totalCr).toBeCloseTo(1.1448, 3);
  });
});
