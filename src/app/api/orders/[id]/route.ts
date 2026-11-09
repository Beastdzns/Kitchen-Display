import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, outlets, auditNotifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkOrderLateness } from "@/lib/ai/prepPredictor";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const ord = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!ord) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const items = db.select().from(orderItems).where(eq(orderItems.orderId, orderId)).all();
    const outlet = db.select().from(outlets).where(eq(outlets.id, ord.outletId)).get();
    const customer = db.select().from(users).where(eq(users.id, ord.customerId)).get();
    const notifs = db
      .select()
      .from(auditNotifications)
      .where(eq(auditNotifications.orderId, orderId))
      .all();

    const lateness = checkOrderLateness(ord.placedAt, ord.promisedAt);

    return NextResponse.json({
      order: ord,
      items,
      outlet,
      customer,
      notifications: notifs,
      lateness,
    });
  } catch (error: any) {
    console.error("Order GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

