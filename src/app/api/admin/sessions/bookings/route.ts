import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { isValidUUID, isValidDate } from "@/lib/validation";

export async function GET(request: Request) {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("class_id");
  const date = searchParams.get("date");

  if (!classId || !date || !isValidUUID(classId) || !isValidDate(date)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("class_sessions")
    .select("id, status")
    .eq("class_id", classId)
    .eq("session_date", date)
    .eq("business_id", businessId)
    .single();

  if (!session) {
    return NextResponse.json({ session: null, bookings: [] });
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, status, booked_at, checked_in_at, profiles(first_name, last_name, phone)"
    )
    .eq("session_id", session.id)
    .order("booked_at");

  return NextResponse.json({ session, bookings: bookings || [] });
}
