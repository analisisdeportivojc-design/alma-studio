"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Star, AtSign, BadgeCheck, EyeOff } from "lucide-react";
import InstructorForm from "./InstructorForm";

interface Instructor {
  id: string;
  bio: string | null;
  specialties: string[] | null;
  photo_url: string | null;
  video_urls: string[] | null;
  instagram_handle: string | null;
  tagline: string | null;
  is_active: boolean;
  profiles: { id: string; first_name: string; last_name: string; phone: string | null } | { id: string; first_name: string; last_name: string; phone: string | null }[] | null;
}

export default function InstructorasClient({ instructors: initial }: { instructors: Instructor[] }) {
  const router = useRouter();
  const [instructors, setInstructors] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Instructor | null>(null);

  async function reload() {
    const res = await fetch("/api/admin/instructors");
    const data = await res.json();
    setInstructors(data.instructors || []);
  }

  function openNew() { setEditing(null); setShowForm(true); }
  function openEdit(i: Instructor) { setEditing(i); setShowForm(true); }
  function onSaved() { setShowForm(false); reload(); router.refresh(); }

  const active = instructors.filter((i) => i.is_active);
  const inactive = instructors.filter((i) => !i.is_active);

  return (
    <>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-800">Instructoras</h1>
            <p className="text-stone-500 text-sm mt-1">{active.length} activas · {inactive.length} inactivas</p>
          </div>
          <button onClick={openNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-alma-dark text-white rounded-xl text-sm font-bold hover:bg-alma-dark/90 transition-colors">
            <Plus size={16} />
            Nueva instructora
          </button>
        </div>

        {/* Grid */}
        {instructors.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <Star size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No hay instructoras aún</p>
            <p className="text-sm mt-1">Crea la primera con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {instructors.map((instructor) => {
              const profile = Array.isArray(instructor.profiles) ? instructor.profiles[0] : instructor.profiles;
              const name = profile ? `${profile.first_name} ${profile.last_name}` : "Sin nombre";
              return (
                <div key={instructor.id}
                  className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${instructor.is_active ? "border-stone-100" : "border-stone-200 opacity-60"}`}>

                  {/* Photo banner */}
                  <div className="relative h-44 bg-stone-100">
                    {instructor.photo_url ? (
                      <img src={instructor.photo_url} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-stone-300">
                        {name[0]}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-base leading-tight">{name}</h3>
                        {instructor.is_active ? (
                          <BadgeCheck size={15} className="text-green-400 shrink-0" />
                        ) : (
                          <EyeOff size={15} className="text-stone-300 shrink-0" />
                        )}
                      </div>
                      {instructor.tagline && <p className="text-xs text-white/80 leading-snug">{instructor.tagline}</p>}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    {instructor.bio && (
                      <p className="text-xs text-stone-500 leading-relaxed line-clamp-2 mb-3">{instructor.bio}</p>
                    )}

                    {instructor.specialties && instructor.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {instructor.specialties.slice(0, 3).map((s) => (
                          <span key={s} className="text-xs bg-stone-50 text-stone-600 px-2 py-0.5 rounded-full border border-stone-100">{s}</span>
                        ))}
                        {instructor.specialties.length > 3 && (
                          <span className="text-xs text-stone-400">+{instructor.specialties.length - 3}</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-stone-400">
                        {instructor.instagram_handle && (
                          <span className="flex items-center gap-1"><AtSign size={11} />{instructor.instagram_handle}</span>
                        )}
                        {instructor.video_urls && instructor.video_urls.length > 0 && (
                          <span>{instructor.video_urls.length} video{instructor.video_urls.length !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                      <button onClick={() => openEdit(instructor)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
                        <Pencil size={12} />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <InstructorForm
          instructor={editing}
          onClose={() => setShowForm(false)}
          onSaved={onSaved}
        />
      )}
    </>
  );
}
