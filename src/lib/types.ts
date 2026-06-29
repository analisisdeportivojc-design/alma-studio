export type UserRole =
  | "super_admin"
  | "owner"
  | "admin"
  | "instructor"
  | "reception"
  | "client";

export interface Business {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  country: string;
  whatsapp: string | null;
  instagram: string | null;
  tiktok: string | null;
  website_domain: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  business_id: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Discipline {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface ClassLevel {
  id: string;
  business_id: string;
  name: string;
  subtitle: string | null;
  description: string | null;
  sort_order: number;
}

export interface Instructor {
  id: string;
  user_id: string;
  business_id: string;
  bio: string | null;
  specialties: string[];
  photo_url: string | null;
  is_active: boolean;
}

export interface Class {
  id: string;
  business_id: string;
  discipline_id: string | null;
  level_id: string | null;
  instructor_id: string | null;
  name: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  is_active: boolean;
}

export interface ClassSession {
  id: string;
  class_id: string;
  business_id: string;
  session_date: string;
  status: "scheduled" | "cancelled" | "completed";
  notes: string | null;
  created_at: string;
}

export interface Package {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  total_classes: number;
  duration_days: number;
  freeze_days: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: string;
  user_id: string;
  business_id: string;
  package_id: string;
  classes_remaining: number;
  classes_used: number;
  start_date: string;
  end_date: string;
  freeze_days_remaining: number;
  status: "active" | "frozen" | "expired" | "cancelled";
  payment_id: string | null;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  business_id: string;
  session_id: string;
  subscription_id: string | null;
  status: "confirmed" | "cancelled" | "attended" | "no_show" | "waitlist";
  booked_at: string;
  checked_in_at: string | null;
}

export interface Payment {
  id: string;
  user_id: string;
  business_id: string;
  subscription_id: string | null;
  amount: number;
  currency: string;
  payment_method: string | null;
  external_id: string | null;
  status: "pending" | "completed" | "failed" | "refunded";
  metadata: Record<string, unknown> | null;
  created_at: string;
}
