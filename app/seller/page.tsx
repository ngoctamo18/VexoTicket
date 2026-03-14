import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { CreateOrderForm } from "@/components/create-order-form";
import { SignOutButton } from "@/components/signout-button";

export default async function SellerPage() {
  const profile = await requireRole(["seller"]);
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("seller_event_assignments")
    .select("event_id")
    .eq("seller_id", profile.id);

  const eventIds = (assignments ?? []).map((x) => x.event_id);

  const { data: ticketTypes } = eventIds.length
    ? await supabase
        .from("ticket_types")
        .select("id, name, price")
        .in("event_id", eventIds)
        .eq("is_active", true)
    : { data: [] as Array<{ id: string; name: string; price: number }> };

  return (
    <main className="container grid">
      <div className="row card">
        <div>
          <h2>Seller Dashboard</h2>
          <p className="muted">Tạo đơn bán vé cho các sự kiện đã được phân công</p>
        </div>
        <SignOutButton />
      </div>

      <CreateOrderForm ticketTypes={ticketTypes ?? []} />
    </main>
  );
}
