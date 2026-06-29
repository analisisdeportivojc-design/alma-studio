import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const businessSlug = searchParams.get("business") || "alma-studio";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "start and end dates required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Get business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", businessSlug)
    .single();

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  // Get classes with instructor info
  const { data: classes } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      day_of_week,
      start_time,
      duration_minutes,
      max_capacity,
      discipline_id,
      level_id,
      instructor_id,
      disciplines(name),
      class_levels(name),
      instructors(id, bio, photo_url, profiles(first_name, last_name))
    `)
    .eq("business_id", business.id)
    .eq("is_active", true);

  // Get existing sessions for the date range
  const { data: existingSessions } = await supabase
    .from("class_sessions")
    .select("id, class_id, session_date, status")
    .eq("business_id", business.id)
    .gte("session_date", startDate)
    .lte("session_date", endDate);

  // Get booking counts per session
  const sessionIds = (existingSessions || []).map((s) => s.id);
  let bookingCounts: Record<string, number> = {};

  if (sessionIds.length > 0) {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("session_id")
      .in("session_id", sessionIds)
      .in("status", ["confirmed", "attended"]);

    bookingCounts = (bookings || []).reduce(
      (acc, b) => {
        acc[b.session_id] = (acc[b.session_id] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }

  // Generate sessions for each day in range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const sessions = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1; // Convert to 0=Monday
    const dateStr = d.toISOString().split("T")[0];

    const dayClasses = (classes || []).filter(
      (c) => c.day_of_week === dayOfWeek
    );

    for (const cls of dayClasses) {
      const existingSession = (existingSessions || []).find(
        (s) => s.class_id === cls.id && s.session_date === dateStr
      );

      const booked = existingSession
        ? bookingCounts[existingSession.id] || 0
        : 0;

      sessions.push({
        class_id: cls.id,
        session_id: existingSession?.id || null,
        date: dateStr,
        name: cls.name,
        start_time: cls.start_time,
        duration_minutes: cls.duration_minutes,
        max_capacity: cls.max_capacity,
        booked_count: booked,
        available: cls.max_capacity - booked,
        status: existingSession?.status || "scheduled",
        discipline: (cls.disciplines as any)?.name || null,
        level: (cls.class_levels as any)?.name || null,
        instructor: cls.instructors
          ? {
              id: (cls.instructors as any).id,
              name: `${(cls.instructors as any).profiles?.first_name || ""} ${(cls.instructors as any).profiles?.last_name || ""}`.trim(),
              photo_url: (cls.instructors as any).photo_url,
            }
          : null,
      });
    }
  }

  // Sort by date, then time
  sessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.start_time.localeCompare(b.start_time);
  });

  return NextResponse.json({ sessions });
}
