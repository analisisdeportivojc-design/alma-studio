import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Star, User, Clock, ChevronRight } from "lucide-react";

async function getClientData(userId: string, businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [subscriptions, upcomingBookings, pastBookings, totalAttended] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("id, classes_remaining, classes_used, start_date, end_date, status, packages(name, total_classes)")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .eq("status", "active"),
      supabase
        .from("bookings")
        .select("id, status, class_sessions(session_date, classes(name, start_time))")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .eq("status", "confirmed")
        .gte("class_sessions.session_date", today)
        .order("booked_at", { ascending: true })
        .limit(5),
      supabase
        .from("bookings")
        .select("id, status, booked_at, class_sessions(session_date, classes(name))")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .in("status", ["attended", "confirmed", "no_show"])
        .order("booked_at", { ascending: false })
        .limit(10),
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .eq("status", "attended"),
    ]);

  return {
    subscriptions: subscriptions.data || [],
    upcomingBookings: upcomingBookings.data || [],
    pastBookings: pastBookings.data || [],
    totalAttended: totalAttended.count || 0,
  };
}

export default async function CuentaPage() {
  const { user, role, businessId } = await getUserRole();

  if (!user) redirect("/login");

  const firstName = user.user_metadata?.first_name || "Usuario";
  const lastName = user.user_metadata?.last_name || "";
  const isAdmin = canAccessAdmin(role);
  const isInstructor = role === "instructor";
  const isReception = role === "reception";

  const clientData = businessId
    ? await getClientData(user.id, businessId)
    : { subscriptions: [], upcomingBookings: [], pastBookings: [], totalAttended: 0 };

  const activeSub = clientData.subscriptions[0];

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
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-alma-dark text-white text-xs tracking-wider px-4 py-2 hover:bg-alma-deep transition-colors"
              >
                PANEL ADMIN
              </Link>
            )}
            {isInstructor && (
              <Link
                href="/instructora"
                className="bg-alma-gold text-white text-xs tracking-wider px-4 py-2 hover:bg-alma-warm transition-colors"
              >
                MI PANEL
              </Link>
            )}
            {isReception && (
              <Link
                href="/recepcion"
                className="bg-alma-gold text-white text-xs tracking-wider px-4 py-2 hover:bg-alma-warm transition-colors"
              >
                RECEPCIÓN
              </Link>
            )}
            <span className="text-sm text-stone-500">{firstName}</span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs tracking-wider text-stone-400 hover:text-alma-dark transition-colors uppercase"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-alma-cream rounded-full flex items-center justify-center text-xl font-bold text-alma-dark">
            {firstName[0]}
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
              {firstName} {lastName}
            </h1>
            <p className="text-stone-400 text-sm">{user.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
              {clientData.totalAttended}
            </p>
            <p className="text-xs text-stone-400 mt-1">Clases asistidas</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
              {activeSub?.classes_remaining || 0}
            </p>
            <p className="text-xs text-stone-400 mt-1">Clases disponibles</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
              {clientData.upcomingBookings.length}
            </p>
            <p className="text-xs text-stone-400 mt-1">Próximas reservas</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Active membership */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
                Mi Membresía
              </h2>
              <Star size={16} className="text-alma-gold" />
            </div>
            <div className="p-5">
              {activeSub ? (
                <div>
                  <p className="font-bold text-alma-dark text-lg">
                    {(activeSub.packages as any)?.name}
                  </p>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-400">Clases usadas</span>
                      <span className="text-alma-dark font-bold">
                        {activeSub.classes_used}/{(activeSub.packages as any)?.total_classes}
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2">
                      <div
                        className="bg-alma-gold rounded-full h-2 transition-all"
                        style={{
                          width: `${((activeSub.classes_used / ((activeSub.packages as any)?.total_classes || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-stone-400">Vence</span>
                      <span className="text-alma-dark">
                        {new Date(activeSub.end_date).toLocaleDateString("es-PE")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-stone-300 text-sm mb-4">
                    No tienes membresía activa
                  </p>
                  <Link
                    href="/#paquetes"
                    className="inline-block bg-alma-dark text-white text-xs tracking-wider px-6 py-2.5 hover:bg-alma-deep transition-colors"
                  >
                    VER PAQUETES
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming bookings */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
                Próximas clases
              </h2>
              <Link href="/reserva" className="text-xs text-alma-gold hover:text-alma-dark">
                Reservar más →
              </Link>
            </div>
            <div className="p-5">
              {clientData.upcomingBookings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-stone-300 text-sm mb-4">
                    No tienes clases reservadas
                  </p>
                  <Link
                    href="/reserva"
                    className="inline-block bg-alma-dark text-white text-xs tracking-wider px-6 py-2.5 hover:bg-alma-deep transition-colors"
                  >
                    RESERVAR CLASE
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientData.upcomingBookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between bg-alma-light rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-alma-dark">
                          {b.class_sessions?.classes?.name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {b.class_sessions?.session_date} · {b.class_sessions?.classes?.start_time?.slice(0, 5)}
                        </p>
                      </div>
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                        Confirmada
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* History */}
          <div className="bg-white rounded-xl shadow-sm md:col-span-2">
            <div className="p-5 border-b border-stone-100">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
                Historial de clases
              </h2>
            </div>
            <div className="p-5">
              {clientData.pastBookings.length === 0 ? (
                <p className="text-stone-300 text-sm text-center py-6">
                  Aún no tienes historial
                </p>
              ) : (
                <div className="space-y-2">
                  {clientData.pastBookings.map((b: any) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between py-3 border-b border-stone-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            b.status === "attended"
                              ? "bg-green-500"
                              : b.status === "no_show"
                                ? "bg-red-400"
                                : "bg-stone-300"
                          }`}
                        />
                        <div>
                          <p className="text-sm text-alma-dark">
                            {b.class_sessions?.classes?.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {b.class_sessions?.session_date}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-xs ${
                          b.status === "attended"
                            ? "text-green-600"
                            : b.status === "no_show"
                              ? "text-red-400"
                              : "text-stone-400"
                        }`}
                      >
                        {b.status === "attended"
                          ? "Asistió"
                          : b.status === "no_show"
                            ? "No asistió"
                            : b.status === "confirmed"
                              ? "Confirmada"
                              : b.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Personal info */}
          <div className="bg-white rounded-xl shadow-sm md:col-span-2">
            <div className="p-5 border-b border-stone-100">
              <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
                Mi Información
              </h2>
            </div>
            <div className="p-5 grid sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Nombre</p>
                <p className="text-sm text-alma-dark font-bold">{firstName} {lastName}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Email</p>
                <p className="text-sm text-alma-dark">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">Teléfono</p>
                <p className="text-sm text-alma-dark">
                  {user.user_metadata?.phone || "No registrado"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
