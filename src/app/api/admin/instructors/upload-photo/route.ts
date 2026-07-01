import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const supabase = await createClient();
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const instructorId = formData.get("instructor_id") as string;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `instructors/${instructorId || Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("instructor-photos")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from("instructor-photos")
    .getPublicUrl(path);

  return NextResponse.json({ url: publicUrl });
}
