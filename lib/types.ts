export type AppRole = "admin" | "organizer" | "seller";

export type Profile = {
  id: string;
  full_name: string | null;
  role: AppRole;
  created_at: string;
};

export type EventItem = {
  id: string;
  organizer_id: string;
  title: string;
  description: string | null;
  venue: string;
  start_at: string;
  end_at: string;
  status: "draft" | "published" | "closed";
  created_at: string;
};
