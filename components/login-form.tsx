"use client";

import { FormEvent, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      });

      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Đã gửi magic link. Vui lòng kiểm tra email.");
    });
  };

  return (
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420 }}>
      <h2>Đăng nhập hệ thống vé</h2>
      <p className="muted">Sử dụng email đã được tạo tài khoản trong Supabase Auth.</p>
      <label>
        Email
        <input
          className="input"
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <div style={{ marginTop: 14 }}>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Đang gửi..." : "Gửi magic link"}
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
    </form>
  );
}
