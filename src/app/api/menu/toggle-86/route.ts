import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { outletMenuOverrides, menuItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { outletId, menuItemId, isAvailable } = body;

    if (!outletId || !menuItemId || typeof isAvailable !== "number") {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const existing = db
      .select()
      .from(outletMenuOverrides)
      .where(
        and(
          eq(outletMenuOverrides.outletId, outletId),
          eq(outletMenuOverrides.menuItemId, menuItemId)
        )
      )
      .get();

    if (existing) {
      db.update(outletMenuOverrides)
        .set({ isAvailable })
        .where(eq(outletMenuOverrides.id, existing.id))
        .run();
    } else {
      db.insert(outletMenuOverrides)
        .values({
          id: `ovr_${outletId}_${menuItemId}`,
          outletId,
          menuItemId,
          priceOverride: null,
          isAvailable,
        })
        .run();
    }

    // Broadcast in real-time to ALL customers and KDS terminals
    if (global.ioServer) {
      global.ioServer.emit("menu:item_availability_changed", {
        outletId,
        menuItemId,
        isAvailable,
      });
    }

    return NextResponse.json({ success: true, outletId, menuItemId, isAvailable });
  } catch (error: any) {
    console.error("Toggle 86 Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

