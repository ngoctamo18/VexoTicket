import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional().default(""),
  venue: z.string().min(2),
  start_at: z.string(),
  end_at: z.string()
});

export async function POST(request: Request) {
  try {
    const profile = await requireRole(["organizer"]);
    const payload = createEventSchema.parse(await request.json());
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("events")
      .insert({
        organizer_id: profile.id,
        title: payload.title,
        description: payload.description,
        venue: payload.venue,
        start_at: payload.start_at,
        end_at: payload.end_at,
        status: "draft"
      })
      .select("id, title, status")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ event: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid payload" },
      { status: 400 }
    );
  }
}
