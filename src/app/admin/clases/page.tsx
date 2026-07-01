"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, User } from "lucide-react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface ClassItem {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  is_active: boolean;
  instructor_id: string | null;
  instructor_name?: string;
  instructor_photo?: string | null;
}

interface Instructor {
  id: string;
  name: string;
  photo_url: string | null;
}

const emptyForm = {
  name: "",
  day_of_week: 0,
  start_time: "07:00",
  duration_minutes: 50,
  max_capacity: 6,
  instructor_id: "",
};

export default function AdminClasesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [classRes, instrRes] = await Promise.all([
      fetch("/api/admin/classes"),
      fetch("/api/admin/instructors"),
    ]);
    const classData = await classRes.json();
    const instrData = await instrRes.json();

    setBusinessId(classData.business_id || null);
    setClasses(classData.classes || []);

    const instrList: Instructor[] = (instrData.instructors || []).map((i: any) => {
      const profile = Array.isArray(i.profiles) ? i.profiles[0] : i.profiles;
      return {
        id: i.id,
        name: `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim(),
        photo_url: i.photo_url,
      };
    });
    setInstructors(instrList);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);

    const body = {
      ...form,
      business_id: businessId,
      instructor_id: form.instructor_id || null,
    };

    if (editingId) {
      await fetch(`/api/admin/classes/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
    fetchData();
  }

  function handleEdit(cls: ClassItem) {
    setForm({
      name: cls.name,
      day_of_week: cls.day_of_week,
      start_time: cls.start_time.slice(0, 5),
      duration_minutes: cls.duration_minutes,
      max_capacity: cls.max_capacity,
      instructor_id: cls.instructor_id || "",
    });
    setEditingId(cls.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleToggle(id: string, currentActive: boolean) {
    await fetch(`/api/admin/classes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !currentActive }),
    });
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta clase?")) return;
    await fetch(`/api/admin/classes/${id}`, { method: "DELETE" });
    fetchData();
  }

  const grouped = DAYS.reduce((acc, day, i) => {
    acc[i] = classes.filter((c) => c.day_of_week === i);
    return acc;
  }, {} as Record<number, ClassItem[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">Plantillas de Clases</h1>
          <p className="text-stone-500 text-sm mt-1">
            Define el horario base y la instructora por defecto de cada clase
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(emptyForm); }}
          className="flex items-center gap-2 bg-alma-dark text-white text-xs tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          NUEVA CLASE
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm mb-8 space-y-4">
          <h2 className="font-bold text-alma-dark text-sm">
            {editingId ? "Editar clase" : "Nueva clase"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ej: Reformer Foundation"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Día</label>
              <select
                value={form.day_of_week}
                onChange={(e) => setForm({ ...form, day_of_week: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Hora inicio</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Duración (min)</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Aforo máximo</label>
              <input
                type="number"
                value={form.max_capacity}
                onChange={(e) => setForm({ ...form, max_capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>

            {/* Instructora por defecto */}
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">
                Instructora por defecto
              </label>
              <select
                value={form.instructor_id}
                onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              >
                <option value="">Sin asignar</option>
                {instructors.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-alma-dark text-white text-xs tracking-wider px-6 py-2.5 hover:bg-stone-700 transition-colors disabled:opacity-50"
            >
              {saving ? "GUARDANDO..." : editingId ? "GUARDAR CAMBIOS" : "CREAR CLASE"}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditingId(null); }}
              className="text-xs text-stone-400 px-4 py-2.5 hover:text-stone-600"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Classes grouped by day */}
      {loading ? (
        <div className="text-center py-16 text-stone-400">Cargando...</div>
      ) : (
        <div className="space-y-6">
          {DAYS.map((day, i) => {
            const dayCls = grouped[i] || [];
            if (dayCls.length === 0) return null;
            return (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-3 bg-stone-50 border-b border-stone-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{day}</h3>
                </div>
                <table className="w-full">
                  <tbody>
                    {dayCls.map((cls) => {
                      const instr = instructors.find((i) => i.id === cls.instructor_id);
                      return (
                        <tr key={cls.id} className="border-b border-stone-50 hover:bg-stone-50 last:border-0">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-alma-dark">{cls.name}</p>
                            <p className="text-xs text-stone-400 mt-0.5">{cls.start_time.slice(0, 5)} · {cls.duration_minutes} min · aforo {cls.max_capacity}</p>
                          </td>
                          <td className="px-6 py-4">
                            {instr ? (
                              <div className="flex items-center gap-2">
                                {instr.photo_url ? (
                                  <img src={instr.photo_url} alt={instr.name} className="w-7 h-7 rounded-full object-cover" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center">
                                    <User size={12} className="text-stone-400" />
                                  </div>
                                )}
                                <span className="text-sm text-stone-600">{instr.name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-amber-500 bg-amber-50 px-2 py-1 rounded-full">Sin instructora</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggle(cls.id, cls.is_active)}
                              className={`text-xs px-2 py-1 rounded-full ${cls.is_active ? "bg-green-50 text-green-600" : "bg-stone-100 text-stone-400"}`}
                            >
                              {cls.is_active ? "Activa" : "Inactiva"}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleEdit(cls)} className="p-1.5 text-stone-400 hover:text-alma-dark transition-colors">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(cls.id)} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
