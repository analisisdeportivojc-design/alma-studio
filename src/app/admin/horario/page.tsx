"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar, User, X, Check, AlertCircle, Loader2, Wand2, RotateCcw } from "lucide-react";

const DAYS_ES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

interface ClassTemplate {
  id: string;
  name: string;
  day_of_week: number; // 0=Mon...6=Sun
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  discipline: string | null;
  level: string | null;
}

interface Session {
  id: string;
  class_id: string;
  session_date: string;
  instructor_id: string | null;
  status: string;
  notes: string | null;
  instructors: any;
}

interface Instructor {
  id: string;
  photo_url: string | null;
  tagline: string | null;
  profiles: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null;
}

function getInstructorName(instructor: Instructor | null) {
  if (!instructor) return null;
  const p = Array.isArray(instructor.profiles) ? instructor.profiles[0] : instructor.profiles;
  if (!p) return "Sin nombre";
  return `${p.first_name} ${p.last_name}`;
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

function getWeekLabel(date: Date): string {
  const weekNum = getWeekNumber(date);
  return `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

export default function HorarioPage() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOfWeek(new Date()));
  const [classes, setClasses] = useState<ClassTemplate[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null); // class_id+date being saved
  const [assignModal, setAssignModal] = useState<{ cls: ClassTemplate; date: string } | null>(null);
  const [weekDates, setWeekDates] = useState<string[]>([]);
  const [autofilling, setAutofilling] = useState(false);
  const [autofillMsg, setAutofillMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const weekLabel = getWeekLabel(currentMonday);
  const weekNum = getWeekNumber(currentMonday);

  const load = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await fetch(`/api/admin/schedule?week=${getWeekLabel(currentMonday)}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setApiError(`Error API (${res.status}): ${data.error || "desconocido"}`);
        setLoading(false);
        return;
      }
      setClasses(data.classes || []);
      setSessions(data.sessions || []);
      setInstructors(data.instructors || []);
      setWeekDates(data.week?.dates || []);
    } catch (e: any) {
      setApiError(`Error de red: ${e.message}`);
    }
    setLoading(false);
  }, [currentMonday]);

  useEffect(() => { load(); }, [load]);

  function prevWeek() {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() - 7);
    setCurrentMonday(d);
  }

  function nextWeek() {
    const d = new Date(currentMonday);
    d.setDate(d.getDate() + 7);
    setCurrentMonday(d);
  }

  function goToday() {
    setCurrentMonday(getMondayOfWeek(new Date()));
  }

  async function handleClear() {
    if (!confirm("¿Limpiar las próximas 2 semanas? Se borrarán todas las asignaciones sin reservas.")) return;
    setAutofilling(true);
    setAutofillMsg(null);
    const res = await fetch("/api/admin/schedule/clear", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeks: 2 }),
    });
    const data = await res.json();
    setAutofilling(false);
    setAutofillMsg({ text: data.message || (res.ok ? "Limpiado" : data.error), ok: res.ok });
    if (res.ok) load();
    setTimeout(() => setAutofillMsg(null), 5000);
  }

  async function handleAutofill(reset = false) {
    if (reset && !confirm("¿Limpiar y rellenar las próximas 2 semanas? Se borrarán las asignaciones sin reservas y se recrearán con las instructoras por defecto.")) return;
    setAutofilling(true);
    setAutofillMsg(null);
    const res = await fetch("/api/admin/schedule/autofill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeks: 2, reset }),
    });
    const data = await res.json();
    setAutofilling(false);
    setAutofillMsg({ text: data.message || (res.ok ? "Listo" : data.error), ok: res.ok });
    if (res.ok) load();
    setTimeout(() => setAutofillMsg(null), 6000);
  }

  function getSession(classId: string, date: string) {
    return sessions.find((s) => s.class_id === classId && s.session_date === date) || null;
  }

  async function assignInstructor(cls: ClassTemplate, date: string, instructorId: string | null) {
    const key = `${cls.id}-${date}`;
    setSaving(key);
    const res = await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: cls.id, date, instructor_id: instructorId }),
    });
    const data = await res.json();
    setSaving(null);
    if (!res.ok || data.error) {
      setApiError(`Error al guardar: ${data.error || res.status}`);
    } else {
      setAssignModal(null);
      load();
    }
  }

  async function toggleCancel(cls: ClassTemplate, date: string, currentStatus: string) {
    const key = `${cls.id}-${date}`;
    setSaving(key);
    const session = getSession(cls.id, date);
    const newStatus = currentStatus === "cancelled" ? "scheduled" : "cancelled";
    await fetch("/api/admin/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: cls.id,
        date,
        instructor_id: session?.instructor_id || null,
        status: newStatus,
      }),
    });
    setSaving(null);
    load();
  }

  // Group classes by day_of_week
  const classesByDay: ClassTemplate[][] = Array.from({ length: 7 }, (_, i) =>
    classes.filter((c) => c.day_of_week === i).sort((a, b) => a.start_time.localeCompare(b.start_time))
  );

  const sunday = new Date(currentMonday);
  sunday.setDate(currentMonday.getDate() + 6);

  const mondayStr = currentMonday.toLocaleDateString("es-PE", { day: "numeric", month: "long" });
  const sundayStr = sunday.toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" });

  // Stats for this week
  const totalSlots = weekDates.reduce((sum, date, i) => sum + classesByDay[i].length, 0);
  const assignedSlots = sessions.filter((s) => s.instructor_id && s.status !== "cancelled").length;
  const cancelledSlots = sessions.filter((s) => s.status === "cancelled").length;
  const unassigned = totalSlots - assignedSlots - cancelledSlots;

  return (
    <div className="p-6 min-h-screen bg-stone-50">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-stone-800">Horario Semanal</h1>
          <p className="text-stone-400 text-sm mt-0.5">{mondayStr} — {sundayStr}</p>
        </div>

        {/* Week navigator */}
        <div className="flex items-center gap-3">
          {/* Stats chips */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            <span className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-full font-medium">
              ✓ {assignedSlots} asignadas
            </span>
            {unassigned > 0 && (
              <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full font-medium">
                ⚠ {unassigned} sin asignar
              </span>
            )}
            {cancelledSlots > 0 && (
              <span className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-medium">
                ✕ {cancelledSlots} canceladas
              </span>
            )}
          </div>

          <button onClick={prevWeek} className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <ChevronLeft size={16} />
          </button>

          <div className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-center min-w-[120px]">
            <p className="text-xs text-stone-400 leading-none mb-0.5">Semana</p>
            <p className="text-lg font-bold text-stone-800 leading-none">{weekNum}</p>
          </div>

          <button onClick={nextWeek} className="w-9 h-9 flex items-center justify-center bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <ChevronRight size={16} />
          </button>

          <button onClick={goToday} className="flex items-center gap-1.5 px-4 py-2 bg-alma-dark text-white text-xs rounded-lg hover:bg-alma-dark/90 transition-colors">
            <Calendar size={13} />
            Hoy
          </button>

          <button
            onClick={() => handleAutofill(false)}
            disabled={autofilling}
            className="flex items-center gap-1.5 px-4 py-2 bg-alma-gold text-white text-xs rounded-lg hover:bg-alma-gold/90 transition-colors disabled:opacity-50"
            title="Crea sesiones para las próximas 2 semanas usando la instructora por defecto de cada clase"
          >
            {autofilling ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
            Auto-rellenar 2 sem.
          </button>

          <button
            onClick={() => handleClear()}
            disabled={autofilling}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-stone-200 text-stone-500 text-xs rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Borra las sesiones sin reservas de las próximas 2 semanas"
          >
            <RotateCcw size={13} />
            Limpiar
          </button>
        </div>
      </div>

      {autofillMsg && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${autofillMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-600"}`}>
          {autofillMsg.text}
        </div>
      )}

      {apiError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {apiError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64 text-stone-400">
          <Loader2 size={24} className="animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {DAYS_ES.map((dayName, dayIndex) => {
            const date = weekDates[dayIndex] || "";
            const dateObj = date ? new Date(date + "T12:00:00") : null;
            const isToday = date === new Date().toISOString().split("T")[0];
            const dayClasses = classesByDay[dayIndex];
            const dayAssigned = dayClasses.filter((c) => {
              const s = getSession(c.id, date);
              return s?.instructor_id && s.status !== "cancelled";
            }).length;

            return (
              <div key={dayIndex} className="flex flex-col gap-2">
                {/* Day header */}
                <div className={`text-center py-2 rounded-xl ${isToday ? "bg-alma-dark text-white" : "bg-white border border-stone-100"}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-alma-gold" : "text-stone-400"}`}>
                    {dayName.slice(0, 3)}
                  </p>
                  <p className={`text-lg font-bold leading-none mt-0.5 ${isToday ? "text-white" : "text-stone-700"}`}>
                    {dateObj?.getDate()}
                  </p>
                  <p className={`text-xs mt-0.5 ${isToday ? "text-stone-300" : "text-stone-300"}`}>
                    {dayClasses.length > 0 ? `${dayAssigned}/${dayClasses.length}` : "—"}
                  </p>
                </div>

                {/* Class slots */}
                {dayClasses.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-6">
                    <p className="text-xs text-stone-200 text-center">Sin clases</p>
                  </div>
                ) : (
                  dayClasses.map((cls) => {
                    const session = getSession(cls.id, date);
                    const isSaving = saving === `${cls.id}-${date}`;
                    const isCancelled = session?.status === "cancelled";
                    const instructorData = session?.instructors;
                    const instrName = instructorData ? getInstructorName(
                      Array.isArray(instructorData) ? instructorData[0] : instructorData
                    ) : null;
                    const hasInstructor = !!session?.instructor_id;

                    return (
                      <div key={cls.id}
                        className={`bg-white rounded-xl border p-3 transition-all ${
                          isCancelled
                            ? "border-red-100 bg-red-50 opacity-60"
                            : hasInstructor
                              ? "border-green-100"
                              : "border-amber-100"
                        }`}>

                        {/* Class info */}
                        <div className="mb-2">
                          <p className="text-xs font-bold text-stone-800 leading-tight truncate">{cls.name}</p>
                          <p className="text-xs text-stone-400 mt-0.5">{formatTime(cls.start_time)} · {cls.duration_minutes}′</p>
                          {cls.discipline && (
                            <span className="text-xs text-stone-400">{cls.discipline}</span>
                          )}
                        </div>

                        {/* Instructor chip */}
                        <div className="mb-2">
                          {isCancelled ? (
                            <span className="text-xs text-red-500 font-medium">Cancelada</span>
                          ) : hasInstructor ? (
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <Check size={10} className="text-green-600" />
                              </div>
                              <span className="text-xs text-stone-700 font-medium truncate leading-tight">{instrName}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <AlertCircle size={12} className="text-amber-400 shrink-0" />
                              <span className="text-xs text-amber-600">Sin instructora</span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => setAssignModal({ cls, date })}
                            disabled={isSaving}
                            className="flex-1 text-xs py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                          >
                            {isSaving ? <Loader2 size={10} className="animate-spin" /> : <User size={10} />}
                            {hasInstructor ? "Cambiar" : "Asignar"}
                          </button>
                          <button
                            onClick={() => toggleCancel(cls, date, session?.status || "scheduled")}
                            disabled={isSaving}
                            title={isCancelled ? "Reactivar" : "Cancelar clase"}
                            className={`w-8 rounded-lg text-xs flex items-center justify-center transition-colors disabled:opacity-50 ${
                              isCancelled ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-400 hover:bg-red-100"
                            }`}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Assign instructor modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAssignModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-alma-dark text-white px-5 py-4">
              <button onClick={() => setAssignModal(null)} className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                <X size={14} />
              </button>
              <p className="font-bold text-sm">{assignModal.cls.name}</p>
              <p className="text-xs text-stone-300 mt-0.5">
                {DAYS_ES[assignModal.cls.day_of_week]} · {formatTime(assignModal.cls.start_time)}
              </p>
              <p className="text-xs text-alma-gold mt-1">
                {new Date(assignModal.date + "T12:00:00").toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Selecciona instructora</p>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {/* Sin asignar */}
                <button
                  onClick={() => assignInstructor(assignModal.cls, assignModal.date, null)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
                    <X size={14} className="text-stone-400" />
                  </div>
                  <span className="text-sm text-stone-400">Sin instructora asignada</span>
                </button>

                {instructors.map((instr) => {
                  const name = getInstructorName(instr);
                  const currentSession = getSession(assignModal.cls.id, assignModal.date);
                  const isSelected = currentSession?.instructor_id === instr.id;
                  return (
                    <button
                      key={instr.id}
                      onClick={() => assignInstructor(assignModal.cls, assignModal.date, instr.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left ${
                        isSelected ? "border-alma-dark bg-alma-dark/5" : "border-stone-100 hover:bg-stone-50"
                      }`}
                    >
                      {instr.photo_url ? (
                        <img src={instr.photo_url} alt={name || ""} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-alma-light flex items-center justify-center text-sm font-bold text-alma-dark shrink-0">
                          {name?.[0]}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-800 truncate">{name}</p>
                        {instr.tagline && <p className="text-xs text-stone-400 truncate">{instr.tagline}</p>}
                      </div>
                      {isSelected && <Check size={16} className="text-alma-dark shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
