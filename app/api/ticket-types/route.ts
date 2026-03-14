import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  event_id: z.string().uuid(),
  name: z.string().min(1),
  price: z.number().int().positive(),
  quantity: z.number().int().positive()
});

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["organizer"]);
    const payload = schema.parse(await request.json());
    const supabase = await createClient();

    const { data: ownEvent } = await supabase
      .from("events")
      .select("id")
      .eq("id", payload.event_id)
      .eq("organizer_id", profile.id)
      .single();

    if (!ownEvent) {
      return NextResponse.json({ error: "Bạn không sở hữu sự kiện này." }, { status: 403 });
    }

    const { data, error } = await supabase
      .from("ticket_types")
      .insert(payload)
      .select("id, name, price, quantity")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ticket_type: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
