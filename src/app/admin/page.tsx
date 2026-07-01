import Link from "next/link";
import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Users,
  Calendar,
  Package,
  CreditCard,
  TrendingUp,
  Clock,
  AlertTriangle,
  Star,
  Bell,
  CheckCircle2,
  CalendarDays,
  Wand2,
} from "lucide-react";

async function getStats(businessId: string) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const thisMonth = today.slice(0, 7);
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 8).slice(0, 7);

  const [
    clients,
    classes,
    packages,
    bookingsToday,
    paymentsThisMonth,
    paymentsLastMonth,
    subscriptionsActive,
    bookingsThisMonth,
    bookingsLastMonth,
    recentPayments,
  ] = await Promise.all([
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("role", "client"),
    supabase
      .from("classes")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_active", true),
    supabase
      .from("packages")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_active", true),
    supabase
      .from("bookings")
      .select("id, class_sessions!inner(session_date)", {
        count: "exact",
        head: true,
      })
      .eq("business_id", businessId)
      .eq("status", "confirmed")
      .eq("class_sessions.session_date", today),
    supabase
      .from("payments")
      .select("amount")
      .eq("business_id", businessId)
      .eq("status", "completed")
      .gte("created_at", `${thisMonth}-01`),
    supabase
      .from("payments")
      .select("amount")
      .eq("business_id", businessId)
      .eq("status", "completed")
      .gte("created_at", `${lastMonth}-01`)
      .lt("created_at", `${thisMonth}-01`),
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "active"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("booked_at", `${thisMonth}-01`),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("booked_at", `${lastMonth}-01`)
      .lt("booked_at", `${thisMonth}-01`),
    supabase
      .from("payments")
      .select("id, amount, status, created_at, profiles(first_name, last_name)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const incomeThisMonth = (paymentsThisMonth.data || []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );
  const incomeLastMonth = (paymentsLastMonth.data || []).reduce(
    (sum, p) => sum + Number(p.amount),
    0
  );

  return {
    totalClients: clients.count || 0,
    totalClasses: classes.count || 0,
    totalPackages: packages.count || 0,
    bookingsToday: bookingsToday.count || 0,
    incomeThisMonth,
    incomeLastMonth,
    activeSubscriptions: subscriptionsActive.count || 0,
    bookingsThisMonth: bookingsThisMonth.count || 0,
    bookingsLastMonth: bookingsLastMonth.count || 0,
    recentPayments: recentPayments.data || [],
  };
}

async function getTopClasses(businessId: string) {
  const supabase = await createClient();
  const thisMonth = new Date().toISOString().slice(0, 7);

  const { data } = await supabase
    .from("bookings")
    .select("class_sessions!inner(session_date, classes!inner(name))")
    .eq("business_id", businessId)
    .in("status", ["confirmed", "attended"])
    .gte("booked_at", `${thisMonth}-01`);

  const counts: Record<string, number> = {};
  (data || []).forEach((b: any) => {
    const name = b.class_sessions?.classes?.name;
    if (name) counts[name] = (counts[name] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

async function getScheduleHealth(businessId: string) {
  const admin = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const { data: classes } = await admin
    .from("classes")
    .select("id, day_of_week")
    .eq("business_id", businessId)
    .eq("is_active", true);

  if (!classes?.length) return { days_ahead: 0, needs_action: false };

  const futureEnd = new Date(today);
  futureEnd.setDate(today.getDate() + 20);

  const { data: sessions } = await admin
    .from("class_sessions")
    .select("class_id, session_date")
    .eq("business_id", businessId)
    .eq("status", "scheduled")
    .gte("session_date", todayStr)
    .lte("session_date", futureEnd.toISOString().split("T")[0]);

  const existingKeys = new Set((sessions || []).map((s) => `${s.class_id}|${s.session_date}`));

  let daysAhead = 0;
  for (let i = 0; i < 20; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1;
    const dateStr = d.toISOString().split("T")[0];
    const dayClasses = classes.filter((c) => c.day_of_week === dayOfWeek);
    if (dayClasses.length === 0) { daysAhead = i + 1; continue; }
    if (!dayClasses.every((c) => existingKeys.has(`${c.id}|${dateStr}`))) break;
    daysAhead = i + 1;
  }

  const limitDate = new Date(today);
  limitDate.setDate(today.getDate() + daysAhead);

  return {
    days_ahead: daysAhead,
    needs_action: daysAhead < 14,
    limit_date: limitDate.toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }),
  };
}

async function getRecentBookings(businessId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      `id, status, booked_at,
      profiles(first_name, last_name),
      class_sessions(session_date, classes(name))`
    )
    .eq("business_id", businessId)
    .order("booked_at", { ascending: false })
    .limit(8);

  return data || [];
}

function pctChange(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export default async function AdminDashboard() {
  const { businessId } = await getUserRole();
  if (!businessId) return null;

  const [stats, topClasses, recentBookings, scheduleHealth] = await Promise.all([
    getStats(businessId),
    getTopClasses(businessId),
    getRecentBookings(businessId),
    getScheduleHealth(businessId),
  ]);

  const incomePct = pctChange(stats.incomeThisMonth, stats.incomeLastMonth);
  const bookingsPct = pctChange(
    stats.bookingsThisMonth,
    stats.bookingsLastMonth
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
          Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Resumen de Alma Studio —{" "}
          {new Date().toLocaleDateString("es-PE", {
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Tareas pendientes */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Bell size={16} className="text-stone-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500">Tareas pendientes</h2>
        </div>

        <div className="space-y-3">
          {/* Horario */}
          {scheduleHealth.needs_action ? (
            <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
              <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <CalendarDays size={18} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900">
                  El horario vence en {scheduleHealth.days_ahead} días
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Cubierto hasta el <span className="capitalize font-medium">{scheduleHealth.limit_date}</span>. Sube las próximas 2 semanas.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/admin/horario"
                  className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-2 rounded-lg transition-colors font-medium"
                >
                  <Wand2 size={12} />
                  Auto-rellenar
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 bg-green-50 border border-green-100 rounded-xl px-5 py-4">
              <CheckCircle2 size={20} className="text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-800">Horario al día</p>
                <p className="text-xs text-green-600 mt-0.5">
                  Cubierto por {scheduleHealth.days_ahead} días — próximo vencimiento el <span className="capitalize">{scheduleHealth.limit_date}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <CreditCard size={18} className="text-green-600" />
            </div>
            {incomePct !== 0 && (
              <span
                className={`text-xs font-bold ${incomePct > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {incomePct > 0 ? "+" : ""}
                {incomePct}%
              </span>
            )}
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            S/.{stats.incomeThisMonth.toFixed(0)}
          </p>
          <p className="text-stone-400 text-xs mt-1">Ingresos este mes</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar size={18} className="text-blue-600" />
            </div>
            {bookingsPct !== 0 && (
              <span
                className={`text-xs font-bold ${bookingsPct > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {bookingsPct > 0 ? "+" : ""}
                {bookingsPct}%
              </span>
            )}
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            {stats.bookingsThisMonth}
          </p>
          <p className="text-stone-400 text-xs mt-1">Reservas este mes</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users size={18} className="text-purple-600" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            {stats.totalClients}
          </p>
          <p className="text-stone-400 text-xs mt-1">Clientes registrados</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center">
              <Star size={18} className="text-amber-600" />
            </div>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            {stats.activeSubscriptions}
          </p>
          <p className="text-stone-400 text-xs mt-1">Membresías activas</p>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-alma-cream rounded-lg flex items-center justify-center">
            <Clock size={18} className="text-alma-gold" />
          </div>
          <div>
            <p className="font-bold text-alma-dark text-lg">
              {stats.bookingsToday}
            </p>
            <p className="text-stone-400 text-xs">Reservas hoy</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-alma-cream rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-alma-gold" />
          </div>
          <div>
            <p className="font-bold text-alma-dark text-lg">
              {stats.totalClasses}
            </p>
            <p className="text-stone-400 text-xs">Clases activas</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-9 h-9 bg-alma-cream rounded-lg flex items-center justify-center">
            <Package size={18} className="text-alma-gold" />
          </div>
          <div>
            <p className="font-bold text-alma-dark text-lg">
              {stats.totalPackages}
            </p>
            <p className="text-stone-400 text-xs">Paquetes disponibles</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top classes */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Clases más populares
            </h2>
            <p className="text-xs text-stone-400">Este mes</p>
          </div>
          <div className="p-5">
            {topClasses.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">
                Sin datos aún
              </p>
            ) : (
              <div className="space-y-4">
                {topClasses.map((cls, i) => (
                  <div key={cls.name} className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0
                          ? "bg-alma-gold text-white"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-alma-dark">
                        {cls.name}
                      </p>
                    </div>
                    <span className="text-sm text-stone-500">
                      {cls.count} reservas
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Últimos pagos
            </h2>
          </div>
          <div className="p-5">
            {stats.recentPayments.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">
                Sin pagos aún
              </p>
            ) : (
              <div className="space-y-4">
                {stats.recentPayments.map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-alma-dark">
                        {p.profiles?.first_name} {p.profiles?.last_name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {new Date(p.created_at).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-alma-dark">
                        S/.{Number(p.amount).toFixed(0)}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          p.status === "completed"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {p.status === "completed" ? "Pagado" : "Pendiente"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Reservas recientes
            </h2>
          </div>
          <div className="p-5">
            {recentBookings.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">
                Sin reservas aún
              </p>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-alma-dark">
                        {b.profiles?.first_name} {b.profiles?.last_name}
                      </p>
                      <p className="text-xs text-stone-400">
                        {(b.class_sessions as any)?.classes?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-stone-500">
                        {(b.class_sessions as any)?.session_date}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          b.status === "confirmed"
                            ? "bg-green-50 text-green-600"
                            : b.status === "attended"
                              ? "bg-blue-50 text-blue-600"
                              : b.status === "cancelled"
                                ? "bg-red-50 text-red-500"
                                : "bg-stone-50 text-stone-500"
                        }`}
                      >
                        {b.status === "confirmed"
                          ? "Confirmada"
                          : b.status === "attended"
                            ? "Asistió"
                            : b.status === "cancelled"
                              ? "Cancelada"
                              : b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly comparison */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark mb-4">
          Comparativa mensual
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              Ingresos mes anterior
            </p>
            <p className="text-xl font-bold text-stone-400">
              S/.{stats.incomeLastMonth.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              Ingresos mes actual
            </p>
            <p className="text-xl font-bold text-alma-dark">
              S/.{stats.incomeThisMonth.toFixed(0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              Reservas mes anterior
            </p>
            <p className="text-xl font-bold text-stone-400">
              {stats.bookingsLastMonth}
            </p>
          </div>
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-wider mb-1">
              Reservas mes actual
            </p>
            <p className="text-xl font-bold text-alma-dark">
              {stats.bookingsThisMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
