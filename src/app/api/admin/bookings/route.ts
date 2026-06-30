import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { isValidUUID } from "@/lib/validation";

const ALLOWED_STATUS = ["confirmed", "cancelled", "attended", "no_show"];

export async function PATCH(request: Request) {
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

  const { booking_id, status } = body;

  if (
    !booking_id ||
    !isValidUUID(booking_id) ||
    !ALLOWED_STATUS.includes(status)
  ) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const supabase = await createClient();

  const update: Record<string, unknown> = { status };
  if (status === "attended") update.checked_in_at = new Date().toISOString();

  const { error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", booking_id)
    .eq("business_id", businessId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Reserva actualizada" });
}
