"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";

interface ClientProfile {
  first_name: string;
  last_name: string;
  phone: string;
  birth_date: string | null;
  referral_source: string | null;
  objective: string | null;
  medical_notes: string | null;
  notes: string | null;
  preferred_contact: string | null;
  instagram_handle: string | null;
}

export default function EditClientModal({
  userId,
  profile,
  onClose,
  onSaved,
}: {
  userId: string;
  profile: ClientProfile;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ClientProfile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof ClientProfile, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/admin/clients/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Error al guardar");
      return;
    }
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
            Editar cliente
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-alma-dark transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Nombre</label>
              <input
                value={form.first_name}
                onChange={(e) => set("first_name", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Apellido</label>
              <input
                value={form.last_name}
                onChange={(e) => set("last_name", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Teléfono</label>
              <input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.birth_date || ""}
                onChange={(e) => set("birth_date", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Instagram</label>
              <input
                value={form.instagram_handle || ""}
                onChange={(e) => set("instagram_handle", e.target.value)}
                placeholder="@usuario"
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Contacto preferido</label>
              <select
                value={form.preferred_contact || "whatsapp"}
                onChange={(e) => set("preferred_contact", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
                <option value="ninguno">Ninguno</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Canal de llegada</label>
              <select
                value={form.referral_source || ""}
                onChange={(e) => set("referral_source", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              >
                <option value="">— Sin especificar —</option>
                <option value="instagram">Instagram</option>
                <option value="referido">Referido</option>
                <option value="google">Google</option>
                <option value="walk_in">Pasó por la puerta</option>
                <option value="tiktok">TikTok</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Objetivo</label>
              <select
                value={form.objective || ""}
                onChange={(e) => set("objective", e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              >
                <option value="">— Sin especificar —</option>
                <option value="bienestar">Bienestar general</option>
                <option value="perdida_peso">Pérdida de peso</option>
                <option value="rehabilitacion">Rehabilitación</option>
                <option value="deporte">Rendimiento deportivo</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">
              Notas médicas / lesiones
            </label>
            <textarea
              value={form.medical_notes || ""}
              onChange={(e) => set("medical_notes", e.target.value)}
              rows={2}
              placeholder="Lesiones, condiciones médicas, consideraciones para el instructor..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">
              Notas internas del staff
            </label>
            <textarea
              value={form.notes || ""}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              placeholder="Observaciones internas, preferencias, notas de recepción..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-stone-500 hover:text-alma-dark transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-alma-dark text-white text-sm rounded-lg hover:bg-alma-dark/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
