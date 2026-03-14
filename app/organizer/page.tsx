import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateEventForm } from "@/components/create-event-form";
import { SignOutButton } from "@/components/signout-button";

export default async function OrganizerPage() {
  const profile = await requireRole(["organizer"]);
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("id, title, venue, start_at, status")
    .eq("organizer_id", profile.id)
    .order("start_at", { ascending: false });

  return (
    <main className="container grid">
      <div className="row card">
        <div>
          <h2>Organizer Dashboard</h2>
          <p className="muted">Quản lý sự kiện và loại vé của bạn</p>
        </div>
        <SignOutButton />
      </div>

      <CreateEventForm />

      <section className="card">
        <h3>Sự kiện của tôi</h3>
        <div className="grid">
          {(events ?? []).map((event) => (
            <div key={event.id} className="card">
              <div className="row">
                <strong>{event.title}</strong>
                <span className="muted">{event.status}</span>
              </div>
              <p className="muted">{event.venue}</p>
              <p className="muted">{new Date(event.start_at).toLocaleString("vi-VN")}</p>
            </div>
          ))}
          {!events?.length ? <p className="muted">Chưa có sự kiện nào.</p> : null}
        </div>
      </section>
    </main>
  );
}
