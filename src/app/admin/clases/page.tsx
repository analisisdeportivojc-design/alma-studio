"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Edit2 } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface ClassItem {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  is_active: boolean;
}

export default function AdminClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    day_of_week: 0,
    start_time: "07:00",
    duration_minutes: 50,
    max_capacity: 6,
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  async function fetchClasses() {
    const supabase = createClient();
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", "alma-studio")
      .single();

    if (!business) return;
    setBusinessId(business.id);

    const { data } = await supabase
      .from("classes")
      .select("*")
      .eq("business_id", business.id)
      .order("day_of_week")
      .order("start_time");

    setClasses(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;

    const supabase = createClient();

    if (editingId) {
      await supabase.from("classes").update(form).eq("id", editingId);
    } else {
      await supabase
        .from("classes")
        .insert({ ...form, business_id: businessId });
    }

    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "",
      day_of_week: 0,
      start_time: "07:00",
      duration_minutes: 50,
      max_capacity: 6,
    });
    fetchClasses();
  }

  function handleEdit(cls: ClassItem) {
    setForm({
      name: cls.name,
      day_of_week: cls.day_of_week,
      start_time: cls.start_time.slice(0, 5),
      duration_minutes: cls.duration_minutes,
      max_capacity: cls.max_capacity,
    });
    setEditingId(cls.id);
    setShowForm(true);
  }

  async function handleToggle(id: string, currentActive: boolean) {
    const supabase = createClient();
    await supabase
      .from("classes")
      .update({ is_active: !currentActive })
      .eq("id", id);
    fetchClasses();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta clase?")) return;
    const supabase = createClient();
    await supabase.from("classes").delete().eq("id", id);
    fetchClasses();
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            Clases
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Gestiona el horario semanal
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              name: "",
              day_of_week: 0,
              start_time: "07:00",
              duration_minutes: 50,
              max_capacity: 6,
            });
          }}
          className="flex items-center gap-2 bg-alma-dark text-white text-xs tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          NUEVA CLASE
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-6 shadow-sm mb-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Nombre
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="Ej: Reformer Foundation"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Día
            </label>
            <select
              value={form.day_of_week}
              onChange={(e) =>
                setForm({ ...form, day_of_week: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Hora inicio
            </label>
            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Duración (min)
            </label>
            <input
              type="number"
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({ ...form, duration_minutes: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div>
            <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
              Aforo máximo
            </label>
            <input
              type="number"
              value={form.max_capacity}
              onChange={(e) =>
                setForm({ ...form, max_capacity: parseInt(e.target.value) })
              }
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
            />
          </div>
          <div className="flex items-end gap-2">
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
              className="text-xs text-stone-400 px-4 py-2.5 hover:text-stone-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Classes table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Clase
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Día
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Hora
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Duración
              </th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">
                Aforo
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
                <td colSpan={7} className="text-center py-10 text-stone-400">
                  Cargando...
                </td>
              </tr>
            ) : classes.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-10 text-stone-400 text-sm"
                >
                  No hay clases creadas
                </td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr
                  key={cls.id}
                  className="border-b border-stone-50 hover:bg-stone-50"
                >
                  <td className="px-6 py-4 text-sm font-bold text-alma-dark">
                    {cls.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {DAYS[cls.day_of_week]}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {cls.start_time.slice(0, 5)}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {cls.duration_minutes} min
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {cls.max_capacity}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(cls.id, cls.is_active)}
                      className={`text-xs px-2 py-1 rounded-full ${
                        cls.is_active
                          ? "bg-green-50 text-green-600"
                          : "bg-stone-100 text-stone-400"
                      }`}
                    >
                      {cls.is_active ? "Activa" : "Inactiva"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(cls)}
                        className="p-1.5 text-stone-400 hover:text-alma-dark transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls.id)}
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
