import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function GET() {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const { data: businesses } = await supabase.from("businesses").select("id").limit(1).single();
  if (!businesses) return NextResponse.json({ error: "No business" }, { status: 400 });

  const { data, error } = await supabase
    .from("instructors")
    .select("id, bio, specialties, photo_url, video_urls, instagram_handle, tagline, is_active, profiles(id, first_name, last_name, phone)")
    .eq("business_id", businesses.id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ instructors: data });
}

export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: business } = await supabase.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const body = await req.json();
  const { first_name, last_name, phone, email, bio, specialties, photo_url, video_urls, instagram_handle, tagline } = body;

  // Crear usuario auth con service role (admin client)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password: Math.random().toString(36).slice(-10) + "A1!",
    user_metadata: { first_name, last_name, role: "instructor" },
    email_confirm: true,
  });

  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

  const userId = authData.user.id;

  await supabase.from("profiles").upsert({ id: userId, first_name, last_name, phone: phone || null });

  await supabase.from("memberships").insert({ user_id: userId, business_id: business.id, role: "instructor" });

  const { data: instructor, error: instrError } = await supabase
    .from("instructors")
    .insert({
      user_id: userId,
      business_id: business.id,
      bio: bio || null,
      specialties: specialties || [],
      photo_url: photo_url || null,
      video_urls: video_urls || [],
      instagram_handle: instagram_handle || null,
      tagline: tagline || null,
      is_active: true,
    })
    .select()
    .single();

  if (instrError) return NextResponse.json({ error: instrError.message }, { status: 500 });
  return NextResponse.json({ instructor });
}
