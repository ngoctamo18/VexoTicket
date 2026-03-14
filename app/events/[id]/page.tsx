import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title, description, venue, start_at, status")
    .eq("id", id)
    .single();

  if (!event) notFound();

  const { data: ticketTypes } = await supabase
    .from("ticket_types")
    .select("id, name, price, quantity, sold_quantity")
    .eq("event_id", id)
    .eq("is_active", true);

  return (
    <main className="container grid">
      <section className="card">
        <h1>{event.title}</h1>
        <p className="muted">{event.description}</p>
        <p>
          <strong>Địa điểm:</strong> {event.venue}
        </p>
        <p>
          <strong>Bắt đầu:</strong> {new Date(event.start_at).toLocaleString("vi-VN")}
        </p>
      </section>
      <section className="card">
        <h3>Loại vé</h3>
        <div className="grid">
          {(ticketTypes ?? []).map((ticket) => (
            <div key={ticket.id} className="row">
              <span>{ticket.name}</span>
              <span>{ticket.price.toLocaleString("vi-VN")} VND</span>
            </div>
          ))}
          {!ticketTypes?.length ? <p className="muted">Chưa có loại vé.</p> : null}
        </div>
      </section>
    </main>
  );
}
