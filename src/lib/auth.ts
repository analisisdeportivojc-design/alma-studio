import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole(
  businessSlug = "alma-studio"
): Promise<{ user: any; role: UserRole | null; businessId: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, role: null, businessId: null };

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", businessSlug)
    .single();

  if (!business) return { user, role: null, businessId: null };

  const { data: membership } = await supabase
    .from("memberships")
    .select("role")
    .eq("user_id", user.id)
    .eq("business_id", business.id)
    .neq("is_active", false)
    .single();

  return {
    user,
    role: membership?.role || null,
    businessId: business.id,
  };
}

const ADMIN_ROLES: UserRole[] = ["super_admin", "owner", "admin"];

export function canAccessAdmin(role: UserRole | null): boolean {
  return role !== null && ADMIN_ROLES.includes(role);
}
