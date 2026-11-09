import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, menuItems, outletMenuOverrides, outlets } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const outletId = searchParams.get("outletId") || "kondapur";

    const outlet = db.select().from(outlets).where(eq(outlets.id, outletId)).get();
    const cats = db.select().from(categories).orderBy(asc(categories.sortOrder)).all();
    const allItems = db.select().from(menuItems).where(eq(menuItems.isActive, 1)).all();
    const overrides = db
      .select()
      .from(outletMenuOverrides)
      .where(eq(outletMenuOverrides.outletId, outletId))
      .all();

    const overrideMap = new Map(overrides.map((o) => [o.menuItemId, o]));

    const items = allItems.map((item) => {
      const ovr = overrideMap.get(item.id);
      return {
        ...item,
        price: ovr?.priceOverride ?? item.basePrice,
        isAvailable: ovr ? ovr.isAvailable === 1 : true,
        allergensList: JSON.parse(item.allergens || "[]"),
      };
    });

    return NextResponse.json({
      outlet,
      categories: cats,
      items,
    });
  } catch (error: any) {
    console.error("Menu GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
