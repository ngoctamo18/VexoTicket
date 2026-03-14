"use client";

import { FormEvent, useState, useTransition } from "react";

export function CreateEventForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setMessage("");

    startTransition(async () => {
      const payload = {
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        venue: String(formData.get("venue") ?? ""),
        start_at: String(formData.get("start_at") ?? ""),
        end_at: String(formData.get("end_at") ?? "")
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Không thể tạo sự kiện.");
        return;
      }

      setMessage(`Đã tạo sự kiện: ${data.event.title}`);
      form.reset();
    });
  };

  return (
    <form onSubmit={onSubmit} className="card">
      <h3>Tạo sự kiện mới</h3>
      <div className="grid">
        <label>
          Tên sự kiện
          <input className="input" name="title" required />
        </label>
        <label>
          Mô tả
          <textarea className="textarea" name="description" rows={3} />
        </label>
        <label>
          Địa điểm
          <input className="input" name="venue" required />
        </label>
        <label>
          Bắt đầu
          <input className="input" type="datetime-local" name="start_at" required />
        </label>
        <label>
          Kết thúc
          <input className="input" type="datetime-local" name="end_at" required />
        </label>
      </div>
      <div style={{ marginTop: 14 }}>
        <button className="btn" disabled={pending}>
          {pending ? "Đang tạo..." : "Tạo sự kiện"}
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
