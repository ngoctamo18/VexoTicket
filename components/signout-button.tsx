"use client";

import { useTransition } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    });
  };

  return (
    <button className="btn btn-secondary" onClick={handleSignOut} disabled={pending}>
      {pending ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
