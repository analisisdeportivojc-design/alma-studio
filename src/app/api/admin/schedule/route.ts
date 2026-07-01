import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUserRole, canAccessAdmin } from "@/lib/auth";

// GET /api/admin/schedule?week=2026-W27
// Returns all class templates for the business + their sessions for the given week
export async function GET(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("week"); // e.g. "2026-W27"

  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  // Parse week → get Mon-Sun dates
  const { monday, sunday, dates } = parseWeek(weekParam);

  // Get all active class templates
  const { data: classes, error: classesError } = await admin
    .from("classes")
    .select("*")
    .eq("business_id", business.id)
    .neq("is_active", false)
    .order("day_of_week")
    .order("start_time");

  if (classesError) return NextResponse.json({ error: `classes: ${classesError.message}` }, { status: 500 });

  // Get sessions for this week
  const { data: sessions } = await admin
    .from("class_sessions")
    .select("id, class_id, date, instructor_id, status, notes, instructors(id, photo_url, tagline, profiles(first_name, last_name))")
    .eq("business_id", business.id)
    .gte("date", monday)
    .lte("date", sunday);

  // Get all active instructors
  const { data: instructors } = await admin
    .from("instructors")
    .select("id, photo_url, tagline, is_active, profiles(first_name, last_name)")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("id");

  return NextResponse.json({
    classes: classes || [],
    sessions: sessions || [],
    instructors: instructors || [],
    week: { monday, sunday, dates, label: weekParam || getWeekLabel(new Date()) },
  });
}

// POST /api/admin/schedule — upsert a session (assign instructor to a class on a date)
export async function POST(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { data: business } = await admin.from("businesses").select("id").limit(1).single();
  if (!business) return NextResponse.json({ error: "No business" }, { status: 400 });

  const { class_id, date, instructor_id, status, notes } = await req.json();

  const { data, error } = await admin
    .from("class_sessions")
    .upsert(
      {
        class_id,
        date,
        business_id: business.id,
        instructor_id: instructor_id || null,
        status: status || "scheduled",
        notes: notes || null,
      },
      { onConflict: "class_id,date" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ session: data });
}

// DELETE /api/admin/schedule?class_id=x&date=2026-07-07
export async function DELETE(req: NextRequest) {
  const { role } = await getUserRole();
  if (!canAccessAdmin(role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get("class_id");
  const date = searchParams.get("date");

  const { error } = await admin
    .from("class_sessions")
    .delete()
    .eq("class_id", class_id!)
    .eq("date", date!);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseWeek(weekParam: string | null): { monday: string; sunday: string; dates: string[] } {
  let monday: Date;

  if (weekParam && /^\d{4}-W\d{2}$/.test(weekParam)) {
    const [year, weekStr] = weekParam.split("-W");
    const week = parseInt(weekStr);
    // ISO week: week 1 = week containing first Thursday of year
    monday = getMonday(parseInt(year), week);
  } else {
    // Current week
    const today = new Date();
    monday = new Date(today);
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    monday.setDate(today.getDate() + diff);
  }

  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  return {
    monday: monday.toISOString().split("T")[0],
    sunday: sunday.toISOString().split("T")[0],
    dates,
  };
}

function getMonday(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const startOfWeek1 = new Date(jan4);
  startOfWeek1.setDate(jan4.getDate() - (jan4.getDay() || 7) + 1);
  const monday = new Date(startOfWeek1);
  monday.setDate(startOfWeek1.getDate() + (week - 1) * 7);
  return monday;
}

function getWeekLabel(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}
