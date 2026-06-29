import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  ArrowLeft,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/clases", label: "Clases", icon: Calendar },
  { href: "/admin/paquetes", label: "Paquetes", icon: Package },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getUserRole();

  if (!user) redirect("/login");
  if (!canAccessAdmin(role)) redirect("/cuenta");

  const firstName = user.user_metadata?.first_name || "Admin";

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-alma-dark text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-playfair)] text-xl"
          >
            Alma Studio
          </Link>
          <p className="text-stone-400 text-xs mt-1 uppercase tracking-wider">
            Panel Admin
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-stone-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>

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
