import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1>Event Ticketing System</h1>
        <p className="muted">
          Nền tảng bán vé trực tuyến dùng Supabase làm backend và deploy trên Vercel.
        </p>
        <div className="row" style={{ marginTop: 12 }}>
          <Link className="btn" href="/login">
            Đăng nhập hệ thống
          </Link>
          <Link href="/dashboard">Đi đến Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
