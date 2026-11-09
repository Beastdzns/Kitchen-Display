import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, auditNotifications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: "Missing orderId or status" }, { status: 400 });
    }

    const existing = db.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!existing) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const nowIso = new Date().toISOString();
    const updateData: any = { status };
    if (status === "READY_FOR_PICKUP") {
      updateData.actualReadyAt = nowIso;
    }

    db.update(orders).set(updateData).where(eq(orders.id, orderId)).run();

    // Fetch customer to generate realistic notification
    const customer = db.select().from(users).where(eq(users.id, existing.customerId)).get();
    const recipientPhone = customer?.phone || "0000000001";

    let messageText = "";
    if (status === "PREPARING") {
      messageText = `Company A: Your order ${orderId} is now simmering on dum flame. Our chefs are preparing your meal fresh!`;
    } else if (status === "READY_FOR_PICKUP") {
      messageText = `Company A: Order ${orderId} is freshly packed and ready for pickup at our kitchen station.`;
    } else if (status === "RIDER_HANDOFF") {
      messageText = `Company A: Order ${orderId} has been handed off to delivery partner. Hot biryani heading your way!`;
    } else if (status === "DELIVERED") {
      messageText = `Company A: Order ${orderId} delivered! Hope you loved the authentic Hyderabadi flavors. You earned 5% loyalty points.`;
    }

    if (messageText) {
      db.insert(auditNotifications)
        .values({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          orderId,
          channel: "WHATSAPP",
          recipientPhone,
          messageText,
          sentAt: nowIso,
          status: "DELIVERED",
        })
        .run();
    }

    // Broadcast via WebSockets
    if (global.ioServer) {
      const payload = {
        orderId,
        outletId: existing.outletId,
        status,
        actualReadyAt: updateData.actualReadyAt,
        messageText,
      };

      global.ioServer.to(`order:${orderId}`).emit("order:status_updated", payload);
      global.ioServer.to(`outlet:${existing.outletId}`).emit("kds:ticket_updated", payload);
      global.ioServer.to("admin").emit("admin:order_updated", payload);
    }

    return NextResponse.json({ success: true, orderId, status });
  } catch (error: any) {
    console.error("KDS Status Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
