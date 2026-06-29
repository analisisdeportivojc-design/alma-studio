import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/send";
import { welcomeEmail } from "@/lib/email/templates";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const firstName = user.user_metadata?.first_name || "Alumna";
  const email = user.email;

  if (!email) {
    return NextResponse.json({ error: "Sin email" }, { status: 400 });
  }

  const template = welcomeEmail(firstName);
  const result = await sendEmail(email, template.subject, template.html);

  return NextResponse.json(result);
}
