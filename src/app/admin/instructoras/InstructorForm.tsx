"use client";

import { useState, useRef } from "react";
import { X, Upload, Plus, Trash2, Loader2 } from "lucide-react";

interface InstructorData {
  id?: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  bio: string;
  tagline: string;
  instagram_handle: string;
  specialties: string[];
  video_urls: string[];
  photo_url: string;
  is_active: boolean;
}

interface Props {
  instructor?: any;
  onClose: () => void;
  onSaved: () => void;
}

const SPECIALTIES_OPTIONS = [
  "Pilates Reformer", "Pilates Mat", "Barré", "Stretching", "Yoga", "Funcional", "Danza", "Prenatal", "Rehabilitación"
];

export default function InstructorForm({ instructor, onClose, onSaved }: Props) {
  const isEdit = !!instructor?.id;

  const profile = instructor?.profiles || instructor;

  const [form, setForm] = useState<InstructorData>({
    id: instructor?.id,
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
    email: "",
    bio: instructor?.bio || "",
    tagline: instructor?.tagline || "",
    instagram_handle: instructor?.instagram_handle || "",
    specialties: instructor?.specialties || [],
    video_urls: instructor?.video_urls || [],
    photo_url: instructor?.photo_url || "",
    is_active: instructor?.is_active !== false,
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [newVideo, setNewVideo] = useState("");
  const [newSpecialty, setNewSpecialty] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof InstructorData, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadPhoto(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (form.id) fd.append("instructor_id", form.id);
    const res = await fetch("/api/admin/instructors/upload-photo", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) set("photo_url", data.url);
    else setError("Error subiendo foto: " + (data.error || ""));
  }

  async function save() {
    setError("");
    if (!form.first_name || !form.last_name) { setError("Nombre y apellido son obligatorios"); return; }
    if (!isEdit && !form.email) { setError("Email es obligatorio para crear instructora"); return; }

    setSaving(true);
    const url = isEdit ? `/api/admin/instructors/${form.id}` : "/api/admin/instructors";
    const method = isEdit ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Error guardando"); return; }
    onSaved();
  }

  function toggleSpecialty(s: string) {
    set("specialties", form.specialties.includes(s)
      ? form.specialties.filter((x) => x !== s)
      : [...form.specialties, s]
    );
  }

  function addVideo() {
    if (!newVideo.trim()) return;
    set("video_urls", [...form.video_urls, newVideo.trim()]);
    setNewVideo("");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-alma-dark text-white">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl">
            {isEdit ? "Editar Instructora" : "Nueva Instructora"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Photo */}
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {form.photo_url ? (
                <img src={form.photo_url} alt="" className="w-24 h-24 rounded-xl object-cover border border-stone-200" />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-stone-100 border-2 border-dashed border-stone-300 flex flex-col items-center justify-center text-stone-400 text-xs">
                  <Upload size={20} className="mb-1" />
                  Foto
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <input type="file" ref={fileRef} accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(e.target.files[0])} />
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-sm text-stone-700 transition-colors disabled:opacity-50">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Subiendo..." : "Subir foto"}
              </button>
              <p className="text-xs text-stone-400">JPG, PNG. Máx 5 MB. Preferible cuadrada.</p>
              {form.photo_url && (
                <div className="flex items-center gap-2">
                  <input value={form.photo_url} onChange={(e) => set("photo_url", e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-500 focus:outline-none"
                    placeholder="O pega una URL de imagen" />
                </div>
              )}
              {!form.photo_url && (
                <input value={form.photo_url} onChange={(e) => set("photo_url", e.target.value)}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-500 focus:outline-none"
                  placeholder="O pega una URL de imagen directa" />
              )}
            </div>
          </div>

          {/* Datos personales */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Datos personales</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Nombre *</label>
                <input value={form.first_name} onChange={(e) => set("first_name", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Apellido *</label>
                <input value={form.last_name} onChange={(e) => set("last_name", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
              </div>
              {!isEdit && (
                <div>
                  <label className="text-xs text-stone-500 mb-1 block">Email * (para login)</label>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
                </div>
              )}
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Teléfono / WhatsApp</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
              </div>
            </div>
          </div>

          {/* Perfil profesional */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Perfil profesional</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Tagline (frase corta)</label>
                <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)}
                  placeholder="Ej: Especialista en Pilates Reformer y movilidad"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Biografía</label>
                <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)}
                  rows={4} placeholder="Describe la trayectoria, formación y personalidad de la instructora..."
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none" />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Instagram</label>
                <input value={form.instagram_handle} onChange={(e) => set("instagram_handle", e.target.value)}
                  placeholder="@nombre"
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold" />
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Especialidades</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {SPECIALTIES_OPTIONS.map((s) => (
                <button key={s} type="button" onClick={() => toggleSpecialty(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    form.specialties.includes(s)
                      ? "bg-alma-dark text-white border-alma-dark"
                      : "bg-white text-stone-600 border-stone-200 hover:border-alma-dark"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)}
                placeholder="Otra especialidad..."
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (newSpecialty.trim()) { toggleSpecialty(newSpecialty.trim()); setNewSpecialty(""); } } }}
              />
              <button type="button" onClick={() => { if (newSpecialty.trim()) { toggleSpecialty(newSpecialty.trim()); setNewSpecialty(""); } }}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Videos */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Videos (YouTube u otras URLs)</h3>
            <div className="space-y-2 mb-2">
              {form.video_urls.map((url, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex-1 text-xs text-stone-600 bg-stone-50 px-3 py-2 rounded-lg truncate">{url}</span>
                  <button type="button" onClick={() => set("video_urls", form.video_urls.filter((_, j) => j !== i))}
                    className="text-red-400 hover:text-red-600 p-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={newVideo} onChange={(e) => setNewVideo(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVideo(); } }}
              />
              <button type="button" onClick={addVideo}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors">
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Activa */}
          {isEdit && (
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => set("is_active", !form.is_active)}
                className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? "bg-green-500" : "bg-stone-300"}`}>
                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${form.is_active ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="text-sm text-stone-600">{form.is_active ? "Instructora activa" : "Instructora inactiva"}</span>
            </div>
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-stone-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm hover:bg-stone-50 transition-colors">
            Cancelar
          </button>
          <button onClick={save} disabled={saving}
            className="flex-1 py-2.5 rounded-xl bg-alma-dark text-white text-sm font-bold hover:bg-alma-dark/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear instructora"}
          </button>
        </div>
      </div>
    </div>
  );
}
