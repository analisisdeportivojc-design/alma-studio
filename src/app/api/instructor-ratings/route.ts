import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { instructor_id, business_id, rating, comment } = await req.json();
  if (!instructor_id || !business_id || !rating) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const { error } = await supabase
    .from("instructor_ratings")
    .upsert(
      { instructor_id, user_id: user.id, business_id, rating, comment: comment || null },
      { onConflict: "instructor_id,user_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
