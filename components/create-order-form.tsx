"use client";

import { FormEvent, useState, useTransition } from "react";

type Props = {
  ticketTypes: Array<{ id: string; name: string; price: number }>;
};

export function CreateOrderForm({ ticketTypes }: Props) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setMessage("");

    startTransition(async () => {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: String(fd.get("buyer_name") ?? ""),
          buyer_email: String(fd.get("buyer_email") ?? ""),
          ticket_type_id: String(fd.get("ticket_type_id") ?? ""),
          quantity: Number(fd.get("quantity") ?? 1)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Không thể tạo đơn");
        return;
      }

      setMessage(`Đã tạo đơn #${data.order.id} - ${data.order.total_amount} VND`);
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="card">
      <h3>Bán vé</h3>
      <div className="grid">
        <label>
          Tên khách
          <input className="input" name="buyer_name" required />
        </label>
        <label>
          Email khách
          <input className="input" name="buyer_email" type="email" required />
        </label>
        <label>
          Loại vé
          <select className="select" name="ticket_type_id" required>
            <option value="">Chọn vé</option>
            {ticketTypes.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name} - {tt.price.toLocaleString("vi-VN")} VND
              </option>
            ))}
          </select>
        </label>
        <label>
          Số lượng
          <input className="input" type="number" min={1} name="quantity" defaultValue={1} />
        </label>
      </div>
      <div style={{ marginTop: 14 }}>
        <button className="btn" disabled={pending || ticketTypes.length === 0}>
          {pending ? "Đang xử lý..." : "Tạo đơn vé"}
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
