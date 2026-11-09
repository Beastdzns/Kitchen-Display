import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { partyOrders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partyId } = await params;
    const body = await req.json();
    const { status, cateringManagerNotes, assignedOutletId, estimatedBudget } = body;

    const existing = db.select().from(partyOrders).where(eq(partyOrders.id, partyId)).get();
    if (!existing) {
      return NextResponse.json({ error: "Party order not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (cateringManagerNotes) updateData.cateringManagerNotes = cateringManagerNotes;
    if (assignedOutletId) updateData.assignedOutletId = assignedOutletId;
    if (estimatedBudget) updateData.estimatedBudget = estimatedBudget;

    db.update(partyOrders).set(updateData).where(eq(partyOrders.id, partyId)).run();

    return NextResponse.json({ success: true, partyId, updated: updateData });
  } catch (err: any) {
    console.error("Catering PATCH Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
