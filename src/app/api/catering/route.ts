import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partyOrders, users, outlets } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PARTY_ORDER_MIN_GUESTS, PARTY_ORDER_MIN_NOTICE_HOURS } from "@/lib/constants";

export const dynamic = "force-dynamic";

// GET all party orders (for Catering Manager Desk)
export async function GET(req: NextRequest) {
  try {
    const list = db.select().from(partyOrders).orderBy(desc(partyOrders.createdAt)).all();
    const enriched = list.map((p) => {
      const customer = db.select().from(users).where(eq(users.id, p.customerId)).get();
      const outlet = p.assignedOutletId
        ? db.select().from(outlets).where(eq(outlets.id, p.assignedOutletId)).get()
        : null;
      return {
        ...p,
        customerName: customer?.name || p.contactPerson,
        outletName: outlet?.name || "Unassigned",
      };
    });

    return NextResponse.json({ partyOrders: enriched });
  } catch (err: any) {
    console.error("Catering GET Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST new party order
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerId = "cust-amina",
      eventDate,
      guestCount,
      contactPerson,
      contactPhone,
      packageName,
      customRequirements,
      estimatedBudget,
      assignedOutletId = "kondapur",
    } = body;

    // Constraint: Minimum 15 guests
    if (!guestCount || guestCount < PARTY_ORDER_MIN_GUESTS) {
      return NextResponse.json(
        { error: `Bulk party orders require a minimum of ${PARTY_ORDER_MIN_GUESTS} guests.` },
        { status: 400 }
      );
    }

    // Constraint: Minimum 24 hours notice
    const eventTime = new Date(eventDate).getTime();
    const nowTime = Date.now();
    const diffHours = (eventTime - nowTime) / (1000 * 60 * 60);

    if (diffHours < PARTY_ORDER_MIN_NOTICE_HOURS) {
      return NextResponse.json(
        { error: `Party orders require at least ${PARTY_ORDER_MIN_NOTICE_HOURS} hours advance notice.` },
        { status: 400 }
      );
    }

    const partyId = `PARTY-${Math.floor(1000 + Math.random() * 9000)}`;

    db.insert(partyOrders)
      .values({
        id: partyId,
        customerId,
        eventDate,
        guestCount,
        contactPerson,
        contactPhone,
        packageName,
        customRequirements: customRequirements || null,
        estimatedBudget,
        assignedOutletId,
        status: "SUBMITTED",
        cateringManagerNotes: "Inquiry received online. Awaiting chef assignment.",
        createdAt: new Date().toISOString(),
      })
      .run();

    return NextResponse.json({
      success: true,
      partyId,
      message: "Party order submitted! Catering manager will confirm within 2 hours.",
    });
  } catch (err: any) {
    console.error("Catering POST Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

