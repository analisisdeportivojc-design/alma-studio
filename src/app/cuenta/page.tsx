import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Calendar, Star, User, Clock, ChevronRight, Gift } from "lucide-react";
import AplicarReferido from "@/components/AplicarReferido";

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

  // Get referral data
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  const { data: myReferrals } = await supabase
    .from("referrals")
    .select("id, status, created_at, profiles!referrals_referred_id_fkey(first_name)")
    .eq("referrer_id", userId)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: wasReferred } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_id", userId)
    .eq("business_id", businessId)
    .single();

  return {
    subscriptions: subscriptions.data || [],
    upcomingBookings: upcomingBookings.data || [],
    pastBookings: pastBookings.data || [],
    totalAttended: totalAttended.count || 0,
    referralCode: profile?.referral_code || null,
    referrals: myReferrals || [],
    totalReferrals: myReferrals?.filter((r) => r.status === "completed" || r.status === "rewarded").length || 0,
    wasReferred: !!wasReferred,
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
    : { subscriptions: [], upcomingBookings: [], pastBookings: [], totalAttended: 0, referralCode: null, referrals: [], totalReferrals: 0, wasReferred: false };

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

          {/* Referrals */}
          <div className="bg-white rounded-xl shadow-sm md:col-span-2">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-alma-gold" />
                <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
                  Invita a una amiga
                </h2>
              </div>
              <span className="text-xs text-alma-gold">
                {clientData.totalReferrals} referidas
              </span>
            </div>
            <div className="p-5">
              <p className="text-sm text-stone-500 mb-4">
                Comparte tu código con una amiga. Cuando se registre y complete su primera clase,
                <strong className="text-alma-gold"> ambas ganan 1 clase gratis</strong>.
              </p>
              {clientData.referralCode ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 bg-alma-light rounded-lg px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Tu código</p>
                      <p className="text-xl font-bold text-alma-dark font-mono tracking-wider">
                        {clientData.referralCode}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`¡Ven a probar Alma Studio conmigo! Usa mi código ${clientData.referralCode} al registrarte y ambas ganamos 1 clase gratis 🤍\n\nhttps://almastudio.com.pe/r/${clientData.referralCode}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-alma-dark text-white text-xs tracking-wider px-6 py-4 hover:bg-alma-deep transition-colors flex items-center justify-center gap-2"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Compartir por WhatsApp
                  </a>
                </div>
              ) : (
                <p className="text-stone-300 text-sm">Código generándose...</p>
              )}
              {clientData.referrals.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-stone-400 uppercase tracking-wider">Tus referidas</p>
                  {clientData.referrals.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0">
                      <span className="text-sm text-alma-dark">
                        {(r.profiles as any)?.first_name || "Alumna"}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.status === "rewarded" ? "bg-green-50 text-green-600" :
                        r.status === "completed" ? "bg-blue-50 text-blue-600" :
                        "bg-stone-50 text-stone-400"
                      }`}>
                        {r.status === "rewarded" ? "Recompensa entregada" :
                         r.status === "completed" ? "Completada" : "Pendiente"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {!clientData.wasReferred && <AplicarReferido />}
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
