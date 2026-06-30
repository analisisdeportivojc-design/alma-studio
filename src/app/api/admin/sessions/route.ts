import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { isValidUUID, isValidDate } from "@/lib/validation";

export async function POST(request: Request) {
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const { class_id, date, status } = body;

  if (
    !class_id ||
    !date ||
    !isValidUUID(class_id) ||
    !isValidDate(date) ||
    !["scheduled", "cancelled"].includes(status)
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: classInfo } = await supabase
    .from("classes")
    .select("id, business_id")
    .eq("id", class_id)
    .eq("business_id", businessId)
    .single();

  if (!classInfo) {
    return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
  }

  const { data: existing } = await supabase
    .from("class_sessions")
    .select("id")
    .eq("class_id", class_id)
    .eq("session_date", date)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("class_sessions")
      .update({ status })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("class_sessions").insert({
      class_id,
      business_id: businessId,
      session_date: date,
      status,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ message: "Sesión actualizada" });
}
