import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, auditNotifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, overrideMinutes } = body;

    if (!orderId || typeof overrideMinutes !== "number") {
      return NextResponse.json({ error: "Missing orderId or overrideMinutes" }, { status: 400 });
    }

    const existing = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentPromised = new Date(existing.promisedAt);
    const newPromised = new Date(currentPromised.getTime() + overrideMinutes * 60000);
    const totalOverride = (existing.managerOverrideMinutes || 0) + overrideMinutes;

    db.update(orders)
      .set({
        promisedAt: newPromised.toISOString(),
        managerOverrideMinutes: totalOverride,
      })
      .where(eq(orders.id, orderId))
      .run();

    const customer = db.select().from(users).where(eq(users.id, existing.customerId)).get();
    const recipientPhone = customer?.phone || "+91 98490 12345";
    const nowIso = new Date().toISOString();

    const messageText = `Company A Kitchen Update: To ensure our slow-cooked dum reaches perfection, your order ${orderId} estimated time has been extended by ${overrideMinutes} mins. New promised time: ${newPromised.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Thank you for your patience!`;

    db.insert(auditNotifications)
      .values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        orderId,
        channel: "SMS",
        recipientPhone,
        messageText,
        sentAt: nowIso,
        status: "DELIVERED",
      })
      .run();

    if (global.ioServer) {
      const payload = {
        orderId,
        outletId: existing.outletId,
        overrideMinutes,
        newPromisedAt: newPromised.toISOString(),
        messageText,
      };

      global.ioServer.to(`order:${orderId}`).emit("order:promised_time_adjusted", payload);
      global.ioServer.to(`outlet:${existing.outletId}`).emit("kds:ticket_updated", payload);
      global.ioServer.to("admin").emit("admin:order_updated", payload);
    }

    return NextResponse.json({
      success: true,
      orderId,
      newPromisedAt: newPromised.toISOString(),
      overrideMinutes: totalOverride,
    });
  } catch (error: any) {
    console.error("KDS Manager Override Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
