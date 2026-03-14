# Event Ticketing System (Admin / Organizer / Seller)

Ứng dụng web bán vé sự kiện trực tuyến xây bằng **Next.js + Supabase**, sẵn sàng deploy lên **Vercel**.

## Tính năng chính

- `Admin`: xem tổng quan hệ thống, quản lý users qua API.
- `Organizer`: tạo và quản lý sự kiện của mình.
- `Seller`: bán vé cho các sự kiện được phân công.
- Xác thực Supabase Auth qua magic link.
- API route có kiểm tra role rõ ràng.
- Database có RLS policy để bảo vệ dữ liệu theo vai trò.

## 1) Cài đặt

```bash
npm install
```

Tạo file `.env.local` từ `.env.example`:

```bash
cp .env.example .env.local
```

Điền các biến:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 2) Tạo schema Supabase

Vào SQL Editor của Supabase và chạy file:

- `supabase/schema.sql`

Sau đó tạo user trong Auth và thêm profile tương ứng vào bảng `profiles` với role:

- `admin`
- `organizer`
- `seller`

## 3) Chạy local

```bash
npm run dev
```

Mở:

- `http://localhost:3000`

## 4) Deploy Vercel

1. Push code lên GitHub.
2. Import repo vào Vercel.
3. Thêm 3 biến môi trường giống `.env.local`.
4. Deploy.

## Cấu trúc chính

- `app/admin` - dashboard Admin
- `app/organizer` - dashboard Organizer
- `app/seller` - dashboard Seller
- `app/api/*` - API role-based
- `lib/supabase/*` - Supabase clients
- `supabase/schema.sql` - schema + RLS
