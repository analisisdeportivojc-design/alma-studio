import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserRole, canAccessAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  ArrowLeft,
  Phone,
  Calendar,
  Package,
  CreditCard,
  AtSign,
  Target,
  MapPin,
  MessageCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import ClientDetailActions from "./ClientDetailActions";

async function getClientData(userId: string, businessId: string) {
  const supabase = await createClient();

  const [{ data: membership }, { data: subscriptions }, { data: payments }, { data: bookings }] =
    await Promise.all([
      supabase
        .from("memberships")
        .select(
          "is_active, created_at, profiles(first_name, last_name, phone, birth_date, referral_source, objective, medical_notes, notes, preferred_contact, instagram_handle)"
        )
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .single(),
      supabase
        .from("subscriptions")
        .select(
          "id, classes_remaining, classes_used, start_date, end_date, status, packages(name, total_classes, price)"
        )
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .order("start_date", { ascending: false }),
      supabase
        .from("payments")
        .select("id, amount, currency, payment_method, status, created_at")
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .order("created_at", { ascending: false }),
      supabase
        .from("bookings")
        .select(
          "id, status, booked_at, checked_in_at, class_sessions(session_date, classes(name))"
        )
        .eq("user_id", userId)
        .eq("business_id", businessId)
        .order("booked_at", { ascending: false })
        .limit(30),
    ]);

  return {
    membership,
    subscriptions: subscriptions || [],
    payments: payments || [],
    bookings: bookings || [],
  };
}

const STATUS_STYLE: Record<string, string> = {
  confirmed: "bg-green-50 text-green-600",
  attended: "bg-blue-50 text-blue-600",
  cancelled: "bg-stone-100 text-stone-400",
  no_show: "bg-red-50 text-red-500",
  waitlist: "bg-amber-50 text-amber-600",
};

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmada",
  attended: "Asistió",
  cancelled: "Cancelada",
  no_show: "No asistió",
  waitlist: "Lista de espera",
};

const REFERRAL_LABEL: Record<string, string> = {
  instagram: "Instagram",
  referido: "Referido",
  google: "Google",
  walk_in: "Pasó por la puerta",
  tiktok: "TikTok",
  otro: "Otro",
};

const OBJECTIVE_LABEL: Record<string, string> = {
  bienestar: "Bienestar general",
  perdida_peso: "Pérdida de peso",
  rehabilitacion: "Rehabilitación",
  deporte: "Rendimiento deportivo",
  otro: "Otro",
};

const CONTACT_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  email: "Email",
  ninguno: "Sin preferencia",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { role, businessId } = await getUserRole();
  if (!canAccessAdmin(role) || !businessId) redirect("/cuenta");

  const { membership, subscriptions, payments, bookings } = await getClientData(id, businessId);

  if (!membership) redirect("/admin/clientes");

  const profile = (membership as any).profiles;
  const activeSub = subscriptions.find((s: any) => s.status === "active");

  const age = profile?.birth_date
    ? Math.floor(
        (new Date().getTime() - new Date(profile.birth_date).getTime()) /
          (1000 * 60 * 60 * 24 * 365.25)
      )
    : null;

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/clientes"
        className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-alma-dark transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver a Clientes
      </Link>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            {profile?.first_name} {profile?.last_name}
          </h1>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {profile?.phone && (
              <span className="flex items-center gap-1.5 text-stone-500 text-sm">
                <Phone size={13} />
                {profile.phone}
              </span>
            )}
            {age !== null && (
              <span className="text-stone-400 text-sm">{age} años</span>
            )}
            {profile?.instagram_handle && (
              <span className="flex items-center gap-1 text-stone-400 text-sm">
                <AtSign size={13} />
                {profile.instagram_handle}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`text-xs px-3 py-1.5 rounded-full ${
              membership.is_active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
            }`}
          >
            {membership.is_active ? "Activo" : "Inactivo"}
          </span>
          <ClientDetailActions userId={id} profile={profile} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-alma-gold" />
            <span className="text-xs uppercase tracking-wider text-stone-500">Membresía activa</span>
          </div>
          {activeSub ? (
            <>
              <p className="font-bold text-alma-dark">{(activeSub as any).packages?.name}</p>
              <p className="text-sm text-stone-500 mt-1">
                {activeSub.classes_remaining} clases restantes
              </p>
              <p className="text-xs text-stone-400 mt-1">
                Vence {new Date(activeSub.end_date).toLocaleDateString("es-PE")}
              </p>
            </>
          ) : (
            <p className="text-stone-400 text-sm">Sin membresía activa</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-alma-gold" />
            <span className="text-xs uppercase tracking-wider text-stone-500">Reservas</span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            {bookings.filter((b: any) => b.status === "confirmed" || b.status === "attended").length}
          </p>
          <p className="text-xs text-stone-400 mt-1">Total históricas</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} className="text-alma-gold" />
            <span className="text-xs uppercase tracking-wider text-stone-500">Pagado total</span>
          </div>
          <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
            S/.
            {payments
              .filter((p) => p.status === "completed")
              .reduce((sum, p) => sum + Number(p.amount), 0)
              .toFixed(0)}
          </p>
          <p className="text-xs text-stone-400 mt-1">
            Cliente desde {new Date(membership.created_at).toLocaleDateString("es-PE")}
          </p>
        </div>
      </div>

      {/* Profile intel */}
      <div className="grid lg:grid-cols-3 gap-4 mb-8">
        {profile?.referral_source && (
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <MapPin size={16} className="text-alma-gold shrink-0" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Llegó por</p>
              <p className="text-sm font-bold text-alma-dark">
                {REFERRAL_LABEL[profile.referral_source] || profile.referral_source}
              </p>
            </div>
          </div>
        )}
        {profile?.objective && (
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <Target size={16} className="text-alma-gold shrink-0" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Objetivo</p>
              <p className="text-sm font-bold text-alma-dark">
                {OBJECTIVE_LABEL[profile.objective] || profile.objective}
              </p>
            </div>
          </div>
        )}
        {profile?.preferred_contact && (
          <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
            <MessageCircle size={16} className="text-alma-gold shrink-0" />
            <div>
              <p className="text-xs text-stone-400 uppercase tracking-wider">Contacto preferido</p>
              <p className="text-sm font-bold text-alma-dark">
                {CONTACT_LABEL[profile.preferred_contact] || profile.preferred_contact}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {(profile?.medical_notes || profile?.notes) && (
        <div className="grid lg:grid-cols-2 gap-4 mb-8">
          {profile?.medical_notes && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={14} className="text-amber-600" />
                <span className="text-xs uppercase tracking-wider text-amber-600 font-bold">
                  Notas médicas
                </span>
              </div>
              <p className="text-sm text-amber-900">{profile.medical_notes}</p>
            </div>
          )}
          {profile?.notes && (
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={14} className="text-stone-500" />
                <span className="text-xs uppercase tracking-wider text-stone-500 font-bold">
                  Notas internas
                </span>
              </div>
              <p className="text-sm text-stone-600">{profile.notes}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Subscriptions history */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Historial de membresías
            </h2>
          </div>
          <div className="p-5">
            {subscriptions.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">Sin membresías</p>
            ) : (
              <div className="space-y-3">
                {subscriptions.map((s: any) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-alma-dark">{s.packages?.name}</p>
                      <p className="text-xs text-stone-400">
                        {new Date(s.start_date).toLocaleDateString("es-PE")} —{" "}
                        {new Date(s.end_date).toLocaleDateString("es-PE")}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase ${
                        s.status === "active"
                          ? "bg-green-50 text-green-600"
                          : s.status === "expired"
                            ? "bg-stone-100 text-stone-400"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payments history */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Historial de pagos
            </h2>
          </div>
          <div className="p-5">
            {payments.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">Sin pagos</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border-b border-stone-50 pb-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-alma-dark">
                        S/.{Number(p.amount).toFixed(0)}
                      </p>
                      <p className="text-xs text-stone-400">
                        {new Date(p.created_at).toLocaleDateString("es-PE")} ·{" "}
                        {p.payment_method || "—"}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full uppercase ${
                        p.status === "completed"
                          ? "bg-green-50 text-green-600"
                          : p.status === "failed"
                            ? "bg-red-50 text-red-500"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking history */}
        <div className="bg-white rounded-xl shadow-sm lg:col-span-2">
          <div className="p-5 border-b border-stone-100">
            <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
              Historial de clases
            </h2>
          </div>
          <div className="p-5">
            {bookings.length === 0 ? (
              <p className="text-stone-300 text-sm text-center py-6">Sin reservas</p>
            ) : (
              <div className="space-y-2">
                {bookings.map((b: any) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-alma-dark">
                        {b.class_sessions?.classes?.name || "—"}
                      </p>
                      <p className="text-xs text-stone-400">
                        {b.class_sessions?.session_date
                          ? new Date(b.class_sessions.session_date).toLocaleDateString("es-PE")
                          : "—"}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-full ${STATUS_STYLE[b.status]}`}>
                      {STATUS_LABEL[b.status] || b.status}
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
