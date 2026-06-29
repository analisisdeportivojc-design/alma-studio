"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit2, Star } from "lucide-react";

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  total_classes: number;
  duration_days: number;
  freeze_days: number;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function AdminPaquetesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    total_classes: 1,
    duration_days: 30,
    freeze_days: 0,
    is_featured: false,
    sort_order: 0,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  async function fetchPackages() {
    const supabase = createClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", "alma-studio")
      .single();

    if (!business) return;
    setBusinessId(business.id);

    const { data } = await supabase
      .from("packages")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order");

    setPackages(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;

    const supabase = createClient();

    if (editingId) {
      await supabase.from("packages").update(form).eq("id", editingId);
    } else {
      await supabase
        .from("packages")
        .insert({ ...form, business_id: businessId });
    }

    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      description: "",
      price: 0,
      total_classes: 1,
      duration_days: 30,
      freeze_days: 0,
      is_featured: false,
      sort_order: 0,
    });
    fetchPackages();
  }

  function handleEdit(pkg: PackageItem) {
    setForm({
      name: pkg.name,
      description: pkg.description || "",
      price: pkg.price,
      total_classes: pkg.total_classes,
      duration_days: pkg.duration_days,
      freeze_days: pkg.freeze_days,
      is_featured: pkg.is_featured,
      sort_order: pkg.sort_order,
    });
    setEditingId(pkg.id);
    setShowForm(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este paquete?")) return;
    const supabase = createClient();
    await supabase.from("packages").delete().eq("id", id);
    fetchPackages();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    const supabase = createClient();
    await supabase
      .from("packages")
      .update({ is_active: !currentActive })
      .eq("id", id);
    fetchPackages();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            Paquetes
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Gestiona precios y membresías
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              name: "",
              description: "",
              price: 0,
              total_classes: 1,
              duration_days: 30,
              freeze_days: 0,
              is_featured: false,
              sort_order: 0,
            });
          }}
          className="flex items-center gap-2 bg-alma-dark text-white text-xs tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          NUEVO PAQUETE
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej: Pack 8"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Descripción
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mat & Barré"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Precio (S/.)
            </label>
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: parseFloat(e.target.value) })
              }
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Total clases
            </label>
            <input
              type="number"
              value={form.total_classes}
              onChange={(e) =>
                setForm({ ...form, total_classes: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Vigencia (días)
            </label>
            <input
              type="number"
              value={form.duration_days}
              onChange={(e) =>
                setForm({ ...form, duration_days: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Días congelamiento
            </label>
            <input
              type="number"
              value={form.freeze_days}
              onChange={(e) =>
                setForm({ ...form, freeze_days: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Orden
            </label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm({ ...form, sort_order: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) =>
                  setForm({ ...form, is_featured: e.target.checked })
                }
                className="rounded"
              />
              Destacado
            </label>
            <button
              type="submit"
              className="bg-alma-dark text-white text-xs tracking-wider px-6 py-2.5 hover:bg-stone-700 transition-colors"
            >
              {editingId ? "GUARDAR" : "CREAR"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-xs text-stone-400 hover:text-stone-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Paquete
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Precio
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Clases
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Vigencia
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Estado
              </th>
              <th className="text-right text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-400">
                  Cargando...
                </td>
              </tr>
            ) : (
              packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-alma-dark">
                        {pkg.name}
                      </span>
                      {pkg.is_featured && (
                        <Star
                          size={14}
                          className="text-amber-400 fill-amber-400"
                        />
                      )}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-stone-400">
                        {pkg.description}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-alma-dark">
                    S/.{pkg.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {pkg.total_classes}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {pkg.duration_days} días
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(pkg.id, pkg.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        pkg.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      {pkg.is_active ? "Activo" : "Inactivo"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="p-1.5 text-stone-400 hover:text-alma-dark transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
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
