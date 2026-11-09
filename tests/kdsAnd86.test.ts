import { describe, it, expect } from "vitest";
import { db } from "../src/lib/db";
import { orders, outletMenuOverrides, auditNotifications } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";

describe("KDS Operations, 86-ing & Audit Notifications", () => {
  it("should have seeded sample order WEB-778120 at Kondapur", () => {
    const ord = db.select().from(orders).where(eq(orders.id, "WEB-778120")).get();
    expect(ord).toBeDefined();
    expect(ord?.outletId).toBe("kondapur");
    expect(ord?.status).toBe("PREPARING");
    expect(ord?.totalAmount).toBe(1180);
  });

  it("should have seeded late sample order WEB-778146 at Kukatpally", () => {
    const ord = db.select().from(orders).where(eq(orders.id, "WEB-778146")).get();
    expect(ord).toBeDefined();
    expect(ord?.outletId).toBe("kukatpally");
    expect(ord?.lateAlertTriggered).toBe(1);
    expect(ord?.totalAmount).toBe(1050);
  });

  it("should support 86-ing / item availability pausing per outlet", () => {
    const outletId = "kondapur";
    const itemId = "chk-dum-biryani-family";

    // Pause item (86 it)
    db.update(outletMenuOverrides)
      .set({ isAvailable: 0 })
      .where(
        and(
          eq(outletMenuOverrides.outletId, outletId),
          eq(outletMenuOverrides.menuItemId, itemId)
        )
      )
      .run();

    const override = db
      .select()
      .from(outletMenuOverrides)
      .where(
        and(
          eq(outletMenuOverrides.outletId, outletId),
          eq(outletMenuOverrides.menuItemId, itemId)
        )
      )
      .get();

    expect(override?.isAvailable).toBe(0);

    // Reset back to available
    db.update(outletMenuOverrides)
      .set({ isAvailable: 1 })
      .where(
        and(
          eq(outletMenuOverrides.outletId, outletId),
          eq(outletMenuOverrides.menuItemId, itemId)
        )
      )
      .run();

    const resetOverride = db
      .select()
      .from(outletMenuOverrides)
      .where(
        and(
          eq(outletMenuOverrides.outletId, outletId),
          eq(outletMenuOverrides.menuItemId, itemId)
        )
      )
      .get();

    expect(resetOverride?.isAvailable).toBe(1);
  });

  it("should have stored audit notifications for sample orders", () => {
    const notifs = db.select().from(auditNotifications).where(eq(auditNotifications.orderId, "WEB-778120")).all();
    expect(notifs.length).toBeGreaterThan(0);
    expect(notifs[0].channel).toBe("WHATSAPP");
    expect(notifs[0].messageText).toContain("WEB-778120");
  });
});
