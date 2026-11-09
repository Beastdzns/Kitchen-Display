import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, outlets, users, auditNotifications, loyaltyLedger } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { calculateOrderPricing } from "@/lib/pricing/calculator";
import { predictPrepTime } from "@/lib/ai/prepPredictor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId = "cust-amina",
      outletId = "kondapur",
      orderType = "DELIVERY",
      items,
      couponCode,
      redeemedPoints = 0,
      paymentMethod = "UPI",
      deliveryAddress,
      customerNotes,
      dpdpConsent = true,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    if (!deliveryAddress) {
      return NextResponse.json({ error: "Delivery address is required" }, { status: 400 });
    }

    const outlet = db.select().from(outlets).where(eq(outlets.id, outletId)).get();
    if (!outlet) {
      return NextResponse.json({ error: "Outlet not found" }, { status: 404 });
    }

    const customer = db.select().from(users).where(eq(users.id, customerId)).get();
    const availablePoints = customer?.loyaltyPoints || 0;

    // 1. Calculate pricing, discounts, and GST breakdown
    const pricing = calculateOrderPricing(
      items.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
      couponCode,
      redeemedPoints,
      availablePoints,
      orderType === "DELIVERY"
    );

    // 2. Count active open tickets in the kitchen for honest AI prep prediction
    const activeTickets = db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.outletId, outletId),
          ne(orders.status, "DELIVERED"),
          ne(orders.status, "CANCELLED")
        )
      )
      .all();

    const prepPrediction = predictPrepTime(
      items.map((i: any) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        basePrepTimeMinutes: 18,
      })),
      outlet,
      activeTickets.length,
      new Date(),
      0
    );

    const now = new Date();
    const promisedTime = new Date(now.getTime() + prepPrediction.promisedMinutes * 60000);
    const orderId = `WEB-${Math.floor(100000 + Math.random() * 900000)}`;

    // 3. Save order to SQLite
    db.insert(orders)
      .values({
        id: orderId,
        customerId,
        outletId,
        orderType,
        status: "RECEIVED",
        subtotal: pricing.itemsSubtotal,
        discount: pricing.totalDiscount,
        gstAmount: pricing.gstAmount,
        deliveryFee: pricing.deliveryFee,
        totalAmount: pricing.finalTotal,
        paymentMethod,
        paymentStatus: "PAID",
        placedAt: now.toISOString(),
        promisedAt: promisedTime.toISOString(),
        aiEstimatedPrepMinutes: prepPrediction.predictedMinutes,
        managerOverrideMinutes: 0,
        actualReadyAt: null,
        lateAlertTriggered: 0,
        deliveryAddress,
        deliveryLat: outlet.lat + 0.005,
        deliveryLng: outlet.lng + 0.005,
        customerNotes: customerNotes || null,
      })
      .run();

    // 4. Save order items
    for (const it of items) {
      db.insert(orderItems)
        .values({
          id: `oi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          orderId,
          menuItemId: it.id,
          itemName: it.name,
          quantity: it.quantity,
          unitPrice: it.price,
          portionSize: it.portionSize || "Standard",
          selectedAddons: "[]",
        })
        .run();
    }

    // 5. Update Customer Loyalty Ledger & DPDP Consent
    if (pricing.loyaltyPointsRedeemed > 0) {
      db.insert(loyaltyLedger)
        .values({
          id: `loy_${Date.now()}_red`,
          userId: customerId,
          orderId,
          pointsChange: -pricing.loyaltyPointsRedeemed,
          reason: `Redeemed at checkout for Order ${orderId}`,
          createdAt: now.toISOString(),
        })
        .run();
    }

    // Credit direct order points
    db.insert(loyaltyLedger)
      .values({
        id: `loy_${Date.now()}_earn`,
        userId: customerId,
        orderId,
        pointsChange: pricing.earnedLoyaltyPoints,
        reason: `5% Direct Order Reward for Order ${orderId}`,
        createdAt: now.toISOString(),
      })
      .run();

    const netPointsChange = pricing.earnedLoyaltyPoints - pricing.loyaltyPointsRedeemed;
    db.update(users)
      .set({
        loyaltyPoints: Math.max(0, availablePoints + netPointsChange),
        dpdpMarketingOptIn: dpdpConsent ? 1 : 0,
      })
      .where(eq(users.id, customerId))
      .run();

    // 6. Insert simulated WhatsApp notification
    const recipientPhone = customer?.phone || "+91 98490 12345";
    const notifMsg = `Company A Order Confirmed! Order #${orderId} has been sent directly to the ${outlet.name} kitchen screen. AI estimated prep: ${prepPrediction.promisedMinutes} mins (${prepPrediction.explanation}). Promised by ${promisedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Track live: http://localhost:3000/order/${orderId}`;

    db.insert(auditNotifications)
      .values({
        id: `notif_${Date.now()}`,
        orderId,
        channel: "WHATSAPP",
        recipientPhone,
        messageText: notifMsg,
        sentAt: now.toISOString(),
        status: "DELIVERED",
      })
      .run();

    // 7. Emit real-time WebSocket event to Outlet KDS tablet!
    if (global.ioServer) {
      const socketPayload = {
        id: orderId,
        outletId,
        orderType,
        status: "RECEIVED",
        totalAmount: pricing.finalTotal,
        paymentMethod,
        placedAt: now.toISOString(),
        promisedAt: promisedTime.toISOString(),
        items,
        deliveryAddress,
        customerNotes,
      };

      global.ioServer.to(`outlet:${outletId}`).emit("kds:order_created", socketPayload);
      global.ioServer.to("admin").emit("admin:order_created", socketPayload);
    }

    return NextResponse.json({
      success: true,
      orderId,
      promisedAt: promisedTime.toISOString(),
      prepMinutes: prepPrediction.promisedMinutes,
      pricing,
    });
  } catch (error: any) {
    console.error("Order Creation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
