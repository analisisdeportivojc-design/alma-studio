import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/cuenta";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const meta = data.user.user_metadata || {};
      const updates: Record<string, unknown> = {};
      if (meta.referral_source) updates.referral_source = meta.referral_source;
      if (meta.objective) updates.objective = meta.objective;

      if (Object.keys(updates).length > 0) {
        await supabase.from("profiles").update(updates).eq("id", data.user.id);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
