import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Event Ticketing System",
  description: "Hệ thống bán vé sự kiện trực tuyến với Admin / Organizer / Seller"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
