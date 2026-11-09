import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, menuItems, outlets } from "@/lib/db/schema";
import { eq, and, ne, desc } from "drizzle-orm";
import { checkOrderLateness } from "@/lib/ai/prepPredictor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get("outletId") || "kondapur";

    const outlet = db.select().from(outlets).where(eq(outlets.id, outletId)).get();
    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    // Fetch non-delivered, non-cancelled orders for this outlet
    const activeOrders = db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.outletId, outletId),
          ne(orders.status, "DELIVERED"),
          ne(orders.status, "CANCELLED")
        )
      )
      .orderBy(desc(orders.placedAt))
      .all();

    const tickets = activeOrders.map((ord) => {
      const items = db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, ord.id))
        .all();

      const lateness = checkOrderLateness(ord.placedAt, ord.promisedAt);

      return {
        ...ord,
        items,
        isLate: lateness.isLate,
        isPastGracePeriod: lateness.isPastGracePeriod,
        minutesLate: lateness.minutesLate,
      };
    });

    return NextResponse.json({
      outlet,
      tickets,
      totalActive: tickets.length,
    });
  } catch (error: any) {
    console.error("KDS Orders Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

