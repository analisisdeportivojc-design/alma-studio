import { getUserRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Users, Calendar, Package, CreditCard } from "lucide-react";

async function getStats(businessId: string) {
  const supabase = await createClient();

  const [clients, classes, packages, bookingsToday] = await Promise.all([
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
      .select("id, class_sessions!inner(session_date)", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "confirmed")
      .eq("class_sessions.session_date", new Date().toISOString().split("T")[0]),
  ]);

  return {
    totalClients: clients.count || 0,
    totalClasses: classes.count || 0,
    totalPackages: packages.count || 0,
    bookingsToday: bookingsToday.count || 0,
  };
}

async function getRecentBookings(businessId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("bookings")
    .select(
      `
      id,
      status,
      booked_at,
      profiles(first_name, last_name),
      class_sessions(
        session_date,
        classes(name)
      )
    `
    )
    .eq("business_id", businessId)
    .order("booked_at", { ascending: false })
    .limit(10);

  return data || [];
}

export default async function AdminDashboard() {
  const { businessId } = await getUserRole();
  if (!businessId) return null;

  const stats = await getStats(businessId);
  const recentBookings = await getRecentBookings(businessId);

  const statCards = [
    {
      label: "Clientes",
      value: stats.totalClients,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Clases activas",
      value: stats.totalClasses,
      icon: Calendar,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Paquetes",
      value: stats.totalPackages,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Reservas hoy",
      value: stats.bookingsToday,
      icon: CreditCard,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
          Dashboard
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Resumen de Alma Studio
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                <stat.icon size={20} />
              </div>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
              {stat.value}
            </p>
            <p className="text-stone-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-stone-100">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
            Reservas recientes
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                  Cliente
                </th>
                <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                  Clase
                </th>
                <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                  Fecha
                </th>
                <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {recentBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-10 text-stone-400 text-sm"
                  >
                    No hay reservas aún
                  </td>
                </tr>
              ) : (
                recentBookings.map((booking: any) => (
                  <tr
                    key={booking.id}
                    className="border-b border-stone-50 hover:bg-stone-50"
                  >
                    <td className="px-6 py-4 text-sm text-alma-dark">
                      {booking.profiles?.first_name}{" "}
                      {booking.profiles?.last_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-600">
                      {booking.class_sessions?.classes?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-stone-500">
                      {booking.class_sessions?.session_date}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-50 text-green-600"
                            : booking.status === "cancelled"
                              ? "bg-red-50 text-red-600"
                              : booking.status === "attended"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-stone-50 text-stone-500"
                        }`}
                      >
                        {booking.status === "confirmed"
                          ? "Confirmada"
                          : booking.status === "cancelled"
                            ? "Cancelada"
                            : booking.status === "attended"
                              ? "Asistió"
                              : booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
