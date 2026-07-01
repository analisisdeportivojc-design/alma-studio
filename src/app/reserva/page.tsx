"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ChevronLeft, ChevronRight, Clock, Users, User, CheckCircle, AlertCircle } from "lucide-react";
import SessionDetailPanel from "./SessionDetailPanel";

interface Session {
  class_id: string;
  session_id: string | null;
  date: string;
  name: string;
  start_time: string;
  duration_minutes: number;
  max_capacity: number;
  booked_count: number;
  available: number;
  status: string;
  discipline: string | null;
  level: string | null;
  instructor: { id: string; name: string; photo_url: string | null } | null;
}

interface MyBooking { id: string; session_id: string; status: string; }
interface Subscription {
  classes_remaining: number;
  end_date: string;
  packages: { name: string } | { name: string }[] | null;
}

const DAYS = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${h12}:${m} ${ampm}`;
}

function formatDateStr(d: Date) { return d.toISOString().split("T")[0]; }

export default function ReservaPage() {
  const [weekStart, setWeekStart] = useState(() => new Date());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [myBookings, setMyBookings] = useState<MyBooking[]>([]);
  const [activeSub, setActiveSub] = useState<Subscription | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [filterDiscipline, setFilterDiscipline] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const weekDates = getWeekDates(weekStart);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchUserData(user.id);
    });
    // get businessId
    supabase.from("businesses").select("id").eq("slug", "alma-studio").single()
      .then(({ data }) => { if (data) setBusinessId(data.id); });
  }, []);

  async function fetchUserData(userId: string) {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    const [{ data: bookings }, { data: subs }] = await Promise.all([
      supabase.from("bookings").select("id, session_id, status").eq("user_id", userId).in("status", ["confirmed", "waitlist"]),
      supabase.from("subscriptions").select("classes_remaining, end_date, packages(name)").eq("user_id", userId).eq("status", "active").gte("end_date", today).order("end_date", { ascending: true }).limit(1),
    ]);
    setMyBookings(bookings || []);
    setActiveSub(subs?.[0] ?? null);
  }

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const dates = getWeekDates(weekStart);
    const start = formatDateStr(dates[0]);
    const end = formatDateStr(dates[6]);
    const res = await fetch(`/api/sessions?start=${start}&end=${end}&business=alma-studio`);
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  async function handleBook(classId: string, date: string) {
    if (!user) { window.location.href = "/login"; return; }
    const key = `${classId}-${date}`;
    setBusyKey(key);
    setMessage(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: classId, date }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.no_subscription ? "No tienes clases disponibles. Compra un paquete para reservar." : data.error, type: "error" });
    } else {
      setMessage({ text: data.message, type: data.waitlist ? "error" : "success" });
      fetchSessions();
      if (user) fetchUserData(user.id);
    }
    setBusyKey(null);
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleCancel(bookingId: string, classId: string, date: string) {
    const key = `cancel-${classId}-${date}`;
    setBusyKey(key);
    setMessage(null);
    const res = await fetch("/api/bookings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId }),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ text: data.error, type: "error" });
    } else {
      setMessage({ text: data.message, type: "success" });
      fetchSessions();
      if (user) fetchUserData(user.id);
    }
    setBusyKey(null);
    setTimeout(() => setMessage(null), 5000);
  }

  const disciplines = [...new Set(sessions.map((s) => s.discipline).filter(Boolean))];
  const instructors = [...new Set(sessions.map((s) => s.instructor?.name).filter(Boolean))];
  const filteredSessions = sessions.filter((s) => {
    if (filterDiscipline && s.discipline !== filterDiscipline) return false;
    if (filterInstructor && s.instructor?.name !== filterInstructor) return false;
    return true;
  });
  const today = formatDateStr(new Date());
  const pkgName = activeSub
    ? Array.isArray(activeSub.packages) ? activeSub.packages[0]?.name : activeSub.packages?.name
    : null;

  return (
    <div className="min-h-screen bg-alma-light">
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">Alma Studio</Link>
          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/cuenta" className="text-sm text-stone-500 hover:text-alma-dark transition-colors">Mi Cuenta</Link>
            ) : (
              <Link href="/login" className="bg-alma-dark text-white text-xs tracking-[0.15em] px-6 py-2 hover:bg-stone-700 transition-colors">INICIAR SESIÓN</Link>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] text-alma-warm mb-3 uppercase">Reserva tu clase</p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-alma-dark">Horario semanal</h1>
        </div>

        {/* Subscription status */}
        {user && (
          <div className="max-w-lg mx-auto mb-6">
            {activeSub ? (
              <div className="flex items-center justify-between bg-white rounded-xl px-5 py-3 shadow-sm border border-stone-100">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-sm text-alma-dark font-bold">{pkgName}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-alma-gold">{activeSub.classes_remaining} clases</span>
                  <p className="text-xs text-stone-400">vence {new Date(activeSub.end_date).toLocaleDateString("es-PE")}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-xl px-5 py-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-sm text-amber-800">No tienes un paquete activo</span>
                </div>
                <Link href="/#paquetes" className="text-xs bg-alma-dark text-white px-4 py-1.5 rounded-lg hover:bg-alma-dark/90 transition-colors">Ver paquetes</Link>
              </div>
            )}
          </div>
        )}

        {message && (
          <div className={`max-w-md mx-auto mb-6 px-4 py-3 rounded-lg text-sm text-center ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <select value={filterDiscipline} onChange={(e) => setFilterDiscipline(e.target.value)} className="px-4 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:border-alma-gold">
            <option value="">Todas las disciplinas</option>
            {disciplines.map((d) => <option key={d} value={d!}>{d}</option>)}
          </select>
          <select value={filterInstructor} onChange={(e) => setFilterInstructor(e.target.value)} className="px-4 py-2 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:border-alma-gold">
            <option value="">Todas las instructoras</option>
            {instructors.map((i) => <option key={i} value={i!}>{i}</option>)}
          </select>
        </div>

        {/* Week navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); }} className="p-2 hover:bg-white rounded-full transition-colors">
            <ChevronLeft size={20} className="text-stone-500" />
          </button>
          <h2 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">
            {MONTHS[weekDates[0].getMonth()]} {weekDates[0].getFullYear()}
          </h2>
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); }} className="p-2 hover:bg-white rounded-full transition-colors">
            <ChevronRight size={20} className="text-stone-500" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {weekDates.map((date, dayIndex) => {
            const dateStr = formatDateStr(date);
            const isToday = dateStr === today;
            const isPast = dateStr < today;
            const daySessions = filteredSessions.filter((s) => s.date === dateStr);

            return (
              <div key={dateStr} className="flex flex-col">
                <div className={`text-center py-3 rounded-t-xl ${isToday ? "bg-alma-dark text-white" : "bg-white text-stone-600"}`}>
                  <p className="text-xs font-bold uppercase">{DAYS[dayIndex]}</p>
                  <p className={`font-[family-name:var(--font-playfair)] text-2xl ${isToday ? "text-white" : "text-alma-dark"}`}>{date.getDate()}</p>
                </div>

                <div className="flex-1 bg-white rounded-b-xl p-3 space-y-3 min-h-[200px]">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-5 h-5 border-2 border-alma-warm border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : daySessions.length === 0 ? (
                    <p className="text-xs text-stone-300 text-center pt-8">Sin clases</p>
                  ) : (
                    daySessions.map((session) => {
                      const isFull = session.available <= 0;
                      const isCancelled = session.status === "cancelled";
                      const bookingKey = `${session.class_id}-${session.date}`;
                      const isBusy = busyKey === bookingKey || busyKey === `cancel-${bookingKey}`;
                      const myBooking = session.session_id ? myBookings.find((b) => b.session_id === session.session_id) ?? null : null;
                      const isBooked = myBooking?.status === "confirmed";
                      const isWaitlisted = myBooking?.status === "waitlist";

                      return (
                        <div
                          key={bookingKey}
                          onClick={() => setSelectedSession(session)}
                          className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                            isPast || isCancelled ? "opacity-40 border-stone-100 bg-stone-50" :
                            isBooked ? "border-green-200 bg-green-50 hover:border-green-300" :
                            isWaitlisted ? "border-amber-200 bg-amber-50 hover:border-amber-300" :
                            isFull ? "border-amber-200 bg-amber-50 hover:border-amber-300" :
                            "border-stone-100 bg-alma-light hover:border-alma-gold hover:shadow-sm"
                          }`}
                        >
                          <p className="font-bold text-alma-dark leading-tight">{session.name}</p>
                          {session.instructor && (
                            <p className="text-alma-warm flex items-center gap-1 mt-1">
                              <User size={10} />
                              {session.instructor.name}
                            </p>
                          )}
                          {session.discipline && (
                            <p className="text-stone-400 mt-0.5">{session.discipline}</p>
                          )}
                          <p className="text-stone-400 flex items-center gap-1 mt-1">
                            <Clock size={10} />
                            {formatTime(session.start_time)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="flex items-center gap-1 text-stone-400">
                              <Users size={10} />
                              {session.booked_count}/{session.max_capacity}
                            </span>
                            {isBooked && <span className="text-green-600 font-bold">✓</span>}
                            {isWaitlisted && <span className="text-amber-600">~</span>}
                            {isCancelled && <span className="text-red-400">✕</span>}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-6 justify-center text-xs text-stone-500">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-alma-light border border-stone-200" />Disponible</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-100 border border-green-200" />Reservada</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-50 border border-amber-200" />Llena / En espera</div>
          <div className="flex items-center gap-2 text-stone-400 italic">Toca cualquier clase para ver detalles</div>
        </div>

        {!user && (
          <div className="mt-10 text-center bg-white rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-stone-500 text-sm mb-4">Inicia sesión para reservar tu clase</p>
            <Link href="/login" className="inline-block bg-alma-dark text-white text-xs tracking-[0.15em] px-8 py-3 hover:bg-stone-700 transition-colors">INICIAR SESIÓN</Link>
          </div>
        )}
      </div>

      {/* Session detail panel */}
      {selectedSession && businessId && (
        <SessionDetailPanel
          session={selectedSession}
          businessId={businessId}
          myBooking={
            selectedSession.session_id
              ? myBookings.find((b) => b.session_id === selectedSession.session_id) ?? null
              : null
          }
          onClose={() => setSelectedSession(null)}
          onBook={(classId, date) => { handleBook(classId, date); setSelectedSession(null); }}
          onCancel={(bookingId, classId, date) => { handleCancel(bookingId, classId, date); setSelectedSession(null); }}
          busy={!!busyKey}
          user={user}
        />
      )}
    </div>
  );
}
