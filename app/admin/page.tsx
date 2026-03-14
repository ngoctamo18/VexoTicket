import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/signout-button";

export default async function AdminPage() {
  const profile = await requireRole(["admin"]);
  const supabase = await createClient();

  const [{ count: totalProfiles }, { count: totalEvents }, { count: totalOrders }] =
    await Promise.all([
      supabase.from("profiles").select("*", { head: true, count: "exact" }),
      supabase.from("events").select("*", { head: true, count: "exact" }),
      supabase.from("orders").select("*", { head: true, count: "exact" })
    ]);

  return (
    <main className="container grid">
      <div className="row card">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="muted">Xin chào {profile.full_name ?? "Admin"}</p>
        </div>
        <SignOutButton />
      </div>

      <section className="grid grid-3">
        <div className="card">
          <h3>{totalProfiles ?? 0}</h3>
          <p className="muted">Tổng tài khoản</p>
        </div>
        <div className="card">
          <h3>{totalEvents ?? 0}</h3>
          <p className="muted">Tổng sự kiện</p>
        </div>
        <div className="card">
          <h3>{totalOrders ?? 0}</h3>
          <p className="muted">Tổng đơn vé</p>
        </div>
      </section>

      <section className="card">
        <h3>API quản trị</h3>
        <p className="muted">
          Có thể gọi <code>/api/admin/users</code> để lấy danh sách user (chỉ admin).
        </p>
        <Link href="/api/admin/users">Mở danh sách users</Link>
      </section>
    </main>
  );
}
