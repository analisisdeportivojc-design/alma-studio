import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = user.user_metadata?.first_name || "Usuario";
  const lastName = user.user_metadata?.last_name || "";

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
          <div className="flex items-center gap-6">
            <span className="text-sm text-stone-500">
              Hola, {firstName}
            </span>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="text-xs tracking-wider text-stone-400 hover:text-alma-dark transition-colors uppercase"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark mb-2">
          Mi Cuenta
        </h1>
        <p className="text-stone-500 text-sm mb-10">
          {firstName} {lastName}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-8">
            <h3 className="font-bold text-alma-dark mb-2">Mis Reservas</h3>
            <p className="text-stone-400 text-sm mb-4">
              Próximas clases reservadas
            </p>
            <div className="text-center py-8 text-stone-300">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm">No tienes reservas próximas</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8">
            <h3 className="font-bold text-alma-dark mb-2">Mi Membresía</h3>
            <p className="text-stone-400 text-sm mb-4">
              Tu plan actual
            </p>
            <div className="text-center py-8 text-stone-300">
              <p className="text-4xl mb-2">⭐</p>
              <p className="text-sm">No tienes membresía activa</p>
              <Link
                href="/#paquetes"
                className="inline-block mt-4 bg-alma-dark text-white text-xs tracking-wider px-6 py-2 uppercase hover:bg-stone-700 transition-colors"
              >
                Ver paquetes
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8">
            <h3 className="font-bold text-alma-dark mb-2">Mi Información</h3>
            <p className="text-stone-400 text-sm mb-4">Datos personales</p>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-stone-400">Nombre:</span>
                <p className="text-alma-dark">
                  {firstName} {lastName}
                </p>
              </div>
              <div>
                <span className="text-stone-400">Email:</span>
                <p className="text-alma-dark">{user.email}</p>
              </div>
              <div>
                <span className="text-stone-400">Teléfono:</span>
                <p className="text-alma-dark">
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
