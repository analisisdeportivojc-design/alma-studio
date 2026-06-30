"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, Phone } from "lucide-react";

interface ClientRow {
  membership_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  member_since: string;
  active_subscription: {
    package_name: string;
    classes_remaining: number;
    end_date: string;
  } | null;
  total_bookings: number;
  last_visit: string | null;
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => r.json())
      .then((data) => {
        setClients(data.clients || []);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    if (!search) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) =>
      `${c.first_name} ${c.last_name} ${c.phone}`.toLowerCase().includes(q)
    );
  }, [clients, search]);

  const activeCount = clients.filter((c) => c.active_subscription).length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            Clientes
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {clients.length} clientes · {activeCount} con membresía activa
          </p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o teléfono..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-alma-gold"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Cliente
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Membresía
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Reservas
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Última visita
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Estado
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
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-stone-400 text-sm">
                  No se encontraron clientes
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.membership_id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/clientes/${c.user_id}`}
                      className="text-sm font-bold text-alma-dark hover:text-alma-gold transition-colors"
                    >
                      {c.first_name} {c.last_name}
                    </Link>
                    <p className="flex items-center gap-1 text-xs text-stone-400 mt-0.5">
                      <Phone size={11} />
                      {c.phone || "Sin teléfono"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {c.active_subscription ? (
                      <>
                        <p className="text-sm text-alma-dark">
                          {c.active_subscription.package_name}
                        </p>
                        <p className="text-xs text-stone-400">
                          {c.active_subscription.classes_remaining} clases · vence{" "}
                          {new Date(c.active_subscription.end_date).toLocaleDateString("es-PE")}
                        </p>
                      </>
                    ) : (
                      <span className="text-xs text-stone-300">Sin membresía</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">{c.total_bookings}</td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {c.last_visit
                      ? new Date(c.last_visit).toLocaleDateString("es-PE")
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        c.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {c.is_active ? "Activo" : "Inactivo"}
                    </span>
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
