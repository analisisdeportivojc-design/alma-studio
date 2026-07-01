import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const body = await req.json();
  const { first_name, last_name, phone, bio, specialties, photo_url, video_urls, instagram_handle, tagline, is_active } = body;

  // Get instructor to find user_id
  const { data: instructor } = await supabase
    .from("instructors")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!instructor) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  // Update profile
  if (first_name || last_name || phone !== undefined) {
    await supabase.from("profiles").update({
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(phone !== undefined && { phone }),
    }).eq("id", instructor.user_id);
  }

  // Update instructor record
  const { error } = await supabase
    .from("instructors")
    .update({
      bio: bio ?? null,
      specialties: specialties || [],
      photo_url: photo_url ?? null,
      video_urls: video_urls || [],
      instagram_handle: instagram_handle ?? null,
      tagline: tagline ?? null,
      ...(is_active !== undefined && { is_active }),
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();

  // Soft delete: set is_active = false
  const { error } = await supabase
    .from("instructors")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
