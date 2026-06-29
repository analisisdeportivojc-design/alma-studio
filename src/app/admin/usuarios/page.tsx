"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Shield } from "lucide-react";

interface Member {
  id: string;
  role: string;
  is_active: boolean;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
  };
}

const ROLES = [
  { value: "owner", label: "Dueño", color: "bg-purple-50 text-purple-600" },
  { value: "admin", label: "Admin", color: "bg-blue-50 text-blue-600" },
  { value: "instructor", label: "Instructora", color: "bg-green-50 text-green-600" },
  { value: "reception", label: "Recepción", color: "bg-amber-50 text-amber-600" },
  { value: "client", label: "Cliente", color: "bg-stone-50 text-stone-500" },
];

function getRoleStyle(role: string) {
  return ROLES.find((r) => r.value === role)?.color || "bg-stone-50 text-stone-500";
}

function getRoleLabel(role: string) {
  return ROLES.find((r) => r.value === role)?.label || role;
}

export default function AdminUsuariosPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    const supabase = createClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", "alma-studio")
      .single();

    if (!business) return;
    setBusinessId(business.id);

    const { data } = await supabase
      .from("memberships")
      .select("id, role, is_active, created_at, profiles(first_name, last_name, phone)")
      .eq("business_id", business.id)
      .order("created_at", { ascending: false });

    setMembers((data as any) || []);
    setLoading(false);
  }

  async function handleRoleChange(membershipId: string, newRole: string) {
    const supabase = createClient();
    await supabase
      .from("memberships")
      .update({ role: newRole })
      .eq("id", membershipId);
    fetchMembers();
  }

  async function handleToggle(membershipId: string, currentActive: boolean) {
    const supabase = createClient();
    await supabase
      .from("memberships")
      .update({ is_active: !currentActive })
      .eq("id", membershipId);
    fetchMembers();
  }

  const grouped = ROLES.map((role) => ({
    ...role,
    members: members.filter((m) => m.role === role.value),
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
          Usuarios
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Gestiona el equipo y clientes · {members.length} usuarios
        </p>
      </div>

      {/* Role summary cards */}
      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {grouped.map((g) => (
          <div key={g.value} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-stone-400" />
              <span className="text-xs uppercase tracking-wider text-stone-500">
                {g.label}
              </span>
            </div>
            <p className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
              {g.members.length}
            </p>
          </div>
        ))}
      </div>

      {/* Members table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Usuario
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Teléfono
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Rol
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Estado
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Registro
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-400">
                  Cargando...
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10 text-stone-400 text-sm"
                >
                  No hay usuarios registrados aún
                </td>
              </tr>
            ) : (
              members.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-alma-dark">
                      {m.profiles?.first_name} {m.profiles?.last_name}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {m.profiles?.phone || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={m.role}
                      onChange={(e) => handleRoleChange(m.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 ${getRoleStyle(m.role)}`}
                    >
                      {ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(m.id, m.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        m.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {m.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-400">
                    {new Date(m.created_at).toLocaleDateString("es-PE")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
