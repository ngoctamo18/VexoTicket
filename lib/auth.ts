import { redirect } from "next/navigation";
import type { AppRole, Profile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, role, created_at")
    .eq("id", user.id)
    .single();

  return (data as Profile | null) ?? null;
}

export async function requireAuth() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(allowedRoles: AppRole[]) {
  const profile = await requireAuth();
  if (!allowedRoles.includes(profile.role)) redirect("/dashboard");
  return profile;
}
