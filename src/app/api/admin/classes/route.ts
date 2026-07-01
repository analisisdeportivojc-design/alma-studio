import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function GET() {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const { data: classes } = await admin
    .from("classes")
    .select("*, instructors(id, photo_url, profiles(first_name, last_name))")
    .eq("business_id", business.id)
    .order("day_of_week")
    .order("start_time");

  return NextResponse.json({ classes: classes || [], business_id: business.id });
}

export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const body = await req.json();

  const { data, error } = await admin
    .from("classes")
    .insert({
      business_id: body.business_id,
      name: body.name,
      day_of_week: body.day_of_week,
      start_time: body.start_time,
      duration_minutes: body.duration_minutes,
      max_capacity: body.max_capacity,
      instructor_id: body.instructor_id || null,
      is_active: true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ class: data });
}
