import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  buyer_name: z.string().min(1),
  buyer_email: z.string().email(),
  ticket_type_id: z.string().uuid(),
  quantity: z.number().int().positive().max(20)
});

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["seller"]);
    const payload = schema.parse(await request.json());
    const supabase = await createClient();

    const { data: ticketType } = await supabase
      .from("ticket_types")
      .select("id, event_id, price, quantity, sold_quantity")
      .eq("id", payload.ticket_type_id)
      .single();

    if (!ticketType) {
      return NextResponse.json({ error: "Không tìm thấy loại vé." }, { status: 404 });
    }

    const { data: assignment } = await supabase
      .from("seller_event_assignments")
      .select("id")
      .eq("seller_id", profile.id)
      .eq("event_id", ticketType.event_id)
      .single();

    if (!assignment) {
      return NextResponse.json({ error: "Bạn không được bán sự kiện này." }, { status: 403 });
    }

    const remaining = ticketType.quantity - ticketType.sold_quantity;
    if (payload.quantity > remaining) {
      return NextResponse.json({ error: "Số lượng vé không đủ." }, { status: 400 });
    }

    const total = payload.quantity * ticketType.price;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        event_id: ticketType.event_id,
        seller_id: profile.id,
        buyer_name: payload.buyer_name,
        buyer_email: payload.buyer_email,
        quantity: payload.quantity,
        total_amount: total,
        status: "paid"
      })
      .select("id, total_amount")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    const ticketRows = Array.from({ length: payload.quantity }).map(() => ({
      order_id: order.id,
      ticket_type_id: ticketType.id,
      event_id: ticketType.event_id,
      qr_code: crypto.randomUUID(),
      status: "active"
    }));

    const [{ error: ticketError }, { error: updateError }] = await Promise.all([
      supabase.from("tickets").insert(ticketRows),
      supabase
        .from("ticket_types")
        .update({ sold_quantity: ticketType.sold_quantity + payload.quantity })
        .eq("id", ticketType.id)
    ]);

    if (ticketError || updateError) {
      return NextResponse.json(
        { error: ticketError?.message || updateError?.message || "Không thể phát hành vé." },
        { status: 400 }
      );
    }

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
