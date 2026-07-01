import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  LayoutDashboard,
  Calendar,
  CalendarCheck,
  Package,
  Users,
  UserCircle,
  CreditCard,
  ArrowLeft,
  Star,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

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
    const allCovered = dayClasses.every((c) => existingKeys.has(`${c.id}|${dateStr}`));
    if (!allCovered) break;
    daysAhead = i + 1;
  }

  return { days_ahead: daysAhead, needs_action: daysAhead < 14 };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, role, businessId } = await getUserRole();

  if (!user) redirect("/login");
  if (!canAccessAdmin(role)) redirect("/cuenta");

  const scheduleHealth = businessId ? await getScheduleHealth(businessId) : { days_ahead: 0, needs_action: false };
  const firstName = user.user_metadata?.first_name || "Admin";

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    {
      href: "/admin/horario",
      label: "Horario",
      icon: CalendarDays,
      alert: scheduleHealth.needs_action,
      alertText: scheduleHealth.needs_action ? `${scheduleHealth.days_ahead}d` : undefined,
    },
    { href: "/admin/clases", label: "Plantillas", icon: Calendar },
    { href: "/admin/reservas", label: "Reservas", icon: CalendarCheck },
    { href: "/admin/clientes", label: "Clientes", icon: UserCircle },
    { href: "/admin/instructoras", label: "Instructoras", icon: Star },
    { href: "/admin/paquetes", label: "Paquetes", icon: Package },
    { href: "/admin/pagos", label: "Pagos", icon: CreditCard },
    { href: "/admin/usuarios", label: "Usuarios", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-alma-dark text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/admin" className="font-[family-name:var(--font-playfair)] text-xl">
            Alma Studio
          </Link>
          <p className="text-stone-400 text-xs mt-1 uppercase tracking-wider">Panel Admin</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {item.alert && (
                <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  <AlertTriangle size={10} />
                  {item.alertText}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Schedule alert banner */}
        {scheduleHealth.needs_action && (
          <div className="mx-4 mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <p className="text-xs font-bold text-amber-300">Horario incompleto</p>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Solo {scheduleHealth.days_ahead} días cubiertos. Sube las próximas 2 semanas.
            </p>
            <Link
              href="/admin/horario"
              className="mt-2 block text-center text-xs bg-amber-500 hover:bg-amber-400 text-white px-3 py-1.5 rounded-md transition-colors"
            >
              Ir a Horario →
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 bg-alma-gold rounded-full flex items-center justify-center text-xs font-bold">
              {firstName[0]}
            </div>
            <div>
              <p className="text-sm">{firstName}</p>
              <p className="text-xs text-stone-400 capitalize">{role}</p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-4 py-2 mt-2 text-xs text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
