import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Users, Clock, ArrowLeft } from "lucide-react";

async function getInstructorData(userId: string, businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);

  // Get instructor record
  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", userId)
    .eq("business_id", businessId)
    .single();

  const instructorId = instructor?.id;

  // Get my classes
  const { data: myClasses } = await supabase
    .from("classes")
    .select("id, name, day_of_week, start_time, duration_minutes, max_capacity")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .eq("instructor_id", instructorId || "");

  // Get today's sessions with bookings
  const { data: todaySessions } = await supabase
    .from("class_sessions")
    .select(`
      id, session_date, status,
      classes!inner(name, start_time, max_capacity, instructor_id),
      bookings(id, status, profiles(first_name, last_name, phone))
    `)
    .eq("business_id", businessId)
    .eq("session_date", today)
    .eq("classes.instructor_id", instructorId || "");

  // Get this month's bookings count
  const { count: monthBookings } = await supabase
    .from("bookings")
    .select("id, class_sessions!inner(classes!inner(instructor_id))", {
      count: "exact",
      head: true,
    })
    .eq("business_id", businessId)
    .in("status", ["confirmed", "attended"])
    .eq("class_sessions.classes.instructor_id", instructorId || "")
    .gte("booked_at", `${thisMonth}-01`);

  // Get upcoming week sessions
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const { data: upcomingSessions } = await supabase
    .from("class_sessions")
    .select(`
      id, session_date, status,
      classes!inner(name, start_time, max_capacity, instructor_id)
    `)
    .eq("business_id", businessId)
    .eq("classes.instructor_id", instructorId || "")
    .gte("session_date", today)
    .lte("session_date", nextWeekStr)
    .order("session_date");

  return {
    myClasses: myClasses || [],
    todaySessions: todaySessions || [],
    monthBookings: monthBookings || 0,
    upcomingSessions: upcomingSessions || [],
    hasInstructorRecord: !!instructor,
  };
}

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default async function InstructoraPage() {
  const { user, role, businessId } = await getUserRole();

  if (!user) redirect("/login");
  if (!businessId) redirect("/cuenta");

  const isInstructor = role === "instructor" || role === "super_admin" || role === "owner" || role === "admin";
  if (!isInstructor) redirect("/cuenta");

  const data = await getInstructorData(user.id, businessId);
  const firstName = user.user_metadata?.first_name || "Instructora";

  return (
    <div className="min-h-screen bg-alma-light">
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark"
          >
            Alma Studio
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-alma-gold uppercase tracking-wider">
              Instructora
            </span>
            <span className="text-sm text-stone-500">{firstName}</span>
            <Link href="/cuenta" className="text-xs text-stone-400 hover:text-alma-dark">
              Mi Cuenta
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark mb-2">
          Hola, {firstName}
        </h1>
        <p className="text-stone-500 text-sm mb-8">
          {new Date().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-alma-cream rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-alma-gold" />
            </div>
            <div>
              <p className="font-bold text-alma-dark text-xl">{data.myClasses.length}</p>
              <p className="text-stone-400 text-xs">Mis clases semanales</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-alma-cream rounded-lg flex items-center justify-center">
              <Users size={18} className="text-alma-gold" />
            </div>
            <div>
              <p className="font-bold text-alma-dark text-xl">{data.monthBookings}</p>
              <p className="text-stone-400 text-xs">Reservas este mes</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-alma-cream rounded-lg flex items-center justify-center">
              <Clock size={18} className="text-alma-gold" />
            </div>
            <div>
              <p className="font-bold text-alma-dark text-xl">{data.todaySessions.length}</p>
              <p className="text-stone-400 text-xs">Clases hoy</p>
            </div>
          </div>
        </div>

        {/* Today's classes with students */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
              Mis clases de hoy
            </h2>
          </div>
          <div className="p-5">
            {data.todaySessions.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-8">
                No tienes clases programadas hoy
              </p>
            ) : (
              <div className="space-y-6">
                {data.todaySessions.map((session: any) => (
                  <div key={session.id} className="border border-stone-100 rounded-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-alma-dark">
                          {session.classes?.name}
                        </h3>
                        <p className="text-sm text-stone-500">
                          {session.classes?.start_time?.slice(0, 5)} · {session.classes?.max_capacity} lugares
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        session.status === "scheduled" ? "bg-green-50 text-green-600" :
                        session.status === "completed" ? "bg-blue-50 text-blue-600" :
                        "bg-red-50 text-red-500"
                      }`}>
                        {session.status === "scheduled" ? "Programada" :
                         session.status === "completed" ? "Completada" : "Cancelada"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">
                      Alumnas reservadas ({session.bookings?.filter((b: any) => b.status === "confirmed" || b.status === "attended").length || 0}/{session.classes?.max_capacity})
                    </p>
                    {session.bookings?.length === 0 ? (
                      <p className="text-stone-300 text-sm">Sin reservas aún</p>
                    ) : (
                      <div className="space-y-2">
                        {session.bookings
                          ?.filter((b: any) => b.status !== "cancelled")
                          .map((booking: any) => (
                          <div key={booking.id} className="flex items-center justify-between bg-alma-light rounded-lg px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-alma-warm/20 rounded-full flex items-center justify-center text-xs font-bold text-alma-dark">
                                {booking.profiles?.first_name?.[0] || "?"}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-alma-dark">
                                  {booking.profiles?.first_name} {booking.profiles?.last_name}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {booking.profiles?.phone || "Sin teléfono"}
                                </p>
                              </div>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === "attended" ? "bg-blue-50 text-blue-600" :
                              booking.status === "confirmed" ? "bg-green-50 text-green-600" :
                              "bg-stone-100 text-stone-500"
                            }`}>
                              {booking.status === "attended" ? "Asistió" :
                               booking.status === "confirmed" ? "Confirmada" : booking.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My weekly schedule */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
              Mi horario semanal
            </h2>
          </div>
          <div className="p-5">
            {data.myClasses.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-8">
                {data.hasInstructorRecord
                  ? "No tienes clases asignadas"
                  : "Tu perfil de instructora aún no está configurado. Contacta al administrador."}
              </p>
            ) : (
              <div className="space-y-3">
                {data.myClasses
                  .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
                  .map((cls) => (
                  <div key={cls.id} className="flex items-center gap-6 bg-alma-light rounded-lg px-5 py-4">
                    <span className="text-sm font-bold text-alma-dark w-24">
                      {DAYS[cls.day_of_week]}
                    </span>
                    <span className="text-sm font-mono text-stone-500 w-14">
                      {cls.start_time.slice(0, 5)}
                    </span>
                    <span className="text-sm text-alma-dark flex-1">
                      {cls.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {cls.duration_minutes} min · {cls.max_capacity} lugares
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
