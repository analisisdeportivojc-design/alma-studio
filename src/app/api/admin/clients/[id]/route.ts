import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  const allowed = [
    "first_name",
    "last_name",
    "phone",
    "birth_date",
    "referral_source",
    "objective",
    "medical_notes",
    "notes",
    "preferred_contact",
    "instagram_handle",
  ];

  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key] === "" ? null : body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  // Verify the user belongs to this business before updating
  const supabase = await createClient();
  const { data: membership } = await supabase
    .from("memberships")
    .select("id")
    .eq("user_id", id)
    .eq("business_id", businessId)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
