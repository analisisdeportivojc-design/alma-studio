import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: instructor }, { data: ratings }] = await Promise.all([
    supabase
      .from("instructors")
      .select("id, bio, specialties, photo_url, video_urls, instagram_handle, tagline, profiles(first_name, last_name)")
      .eq("id", id)
      .single(),
    supabase
      .from("instructor_ratings")
      .select("rating, comment, created_at, profiles(first_name)")
      .eq("instructor_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!instructor) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const avg =
    ratings && ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : null;

  return NextResponse.json({ instructor, ratings: ratings || [], avg_rating: avg });
}
