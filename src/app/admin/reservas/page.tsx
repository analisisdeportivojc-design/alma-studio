"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Ban,
  RotateCcw,
  CheckCircle,
  XCircle,
  X,
} from "lucide-react";

interface SessionRow {
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
  instructor: { name: string } | null;
}

interface BookingRow {
  id: string;
  status: string;
  checked_in_at: string | null;
  profiles: { first_name: string; last_name: string; phone: string } | null;
}

const DAY_LABELS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1; // 0=Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISODate(d: Date) {
  return d.toISOString().split("T")[0];
}

export default function AdminReservasPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/sessions?start=${toISODate(weekStart)}&end=${toISODate(weekEnd)}`
    );
    const data = await res.json();
    setSessions(data.sessions || []);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    fetchSessions();
    setExpanded(null);
  }, [fetchSessions]);

  async function toggleExpand(row: SessionRow) {
    const key = `${row.class_id}-${row.date}`;
    if (expanded === key) {
      setExpanded(null);
      return;
    }
    setExpanded(key);
    setBookingsLoading(true);
    const res = await fetch(
      `/api/admin/sessions/bookings?class_id=${row.class_id}&date=${row.date}`
    );
    const data = await res.json();
    setBookings(data.bookings || []);
    setBookingsLoading(false);
  }

  async function toggleSessionStatus(row: SessionRow) {
    const key = `${row.class_id}-${row.date}`;
    setBusyKey(key);
    const newStatus = row.status === "cancelled" ? "scheduled" : "cancelled";
    await fetch("/api/admin/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ class_id: row.class_id, date: row.date, status: newStatus }),
    });
    await fetchSessions();
    setBusyKey(null);
  }

  async function updateBooking(bookingId: string, status: string) {
    setBusyKey(bookingId);
    await fetch("/api/admin/bookings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, status }),
    });
    const expandedRow = sessions.find(
      (s) => `${s.class_id}-${s.date}` === expanded
    );
    if (expandedRow) await toggleExpand({ ...expandedRow, status: "__refresh__" });
    setBusyKey(null);
  }

  const sessionsByDate = sessions.reduce<Record<string, SessionRow[]>>(
    (acc, s) => {
      (acc[s.date] ||= []).push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            Reservas
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Calendario semanal de clases y reservas
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm px-2 py-2">
          <button
            onClick={() =>
              setWeekStart((w) => {
                const d = new Date(w);
                d.setDate(d.getDate() - 7);
                return d;
              })
            }
            className="p-2 text-stone-400 hover:text-alma-dark transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-alma-dark font-bold min-w-[180px] text-center">
            {weekStart.toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
            {" – "}
            {weekEnd.toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
          </span>
          <button
            onClick={() =>
              setWeekStart((w) => {
                const d = new Date(w);
                d.setDate(d.getDate() + 7);
                return d;
              })
            }
            className="p-2 text-stone-400 hover:text-alma-dark transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="w-6 h-6 border-2 border-alma-gold border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            const dateStr = toISODate(d);
            const daySessions = (sessionsByDate[dateStr] || []).sort((a, b) =>
              a.start_time.localeCompare(b.start_time)
            );

            return (
              <div key={dateStr} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-alma-dark text-white px-6 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-sm">
                    {DAY_LABELS[i]}{" "}
                    <span className="text-stone-300 font-normal">
                      {d.toLocaleDateString("es-PE", { day: "numeric", month: "short" })}
                    </span>
                  </h3>
                  <span className="text-xs text-stone-300">
                    {daySessions.length} clase{daySessions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {daySessions.length === 0 ? (
                  <p className="text-stone-300 text-sm text-center py-6">
                    Sin clases programadas
                  </p>
                ) : (
                  <div className="divide-y divide-stone-50">
                    {daySessions.map((row) => {
                      const key = `${row.class_id}-${row.date}`;
                      const isExpanded = expanded === key;
                      const isCancelled = row.status === "cancelled";

                      return (
                        <div key={key}>
                          <div
                            className={`px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-stone-50 transition-colors ${
                              isCancelled ? "opacity-50" : ""
                            }`}
                            onClick={() => toggleExpand(row)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-sm font-bold text-alma-dark w-14">
                                {row.start_time.slice(0, 5)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-alma-dark">
                                  {row.name}
                                  {isCancelled && (
                                    <span className="ml-2 text-[10px] uppercase text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                                      Cancelada
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {row.discipline || "—"}
                                  {row.instructor ? ` · ${row.instructor.name}` : ""}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-sm text-stone-500">
                                <Users size={14} />
                                {row.booked_count}/{row.max_capacity}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSessionStatus(row);
                                }}
                                disabled={busyKey === key}
                                className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                  isCancelled
                                    ? "bg-green-50 text-green-600 hover:bg-green-100"
                                    : "bg-stone-100 text-stone-500 hover:bg-red-50 hover:text-red-500"
                                }`}
                              >
                                {isCancelled ? (
                                  <>
                                    <RotateCcw size={13} /> Reactivar
                                  </>
                                ) : (
                                  <>
                                    <Ban size={13} /> Cancelar
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="bg-stone-50 px-6 py-4">
                              {bookingsLoading ? (
                                <p className="text-stone-400 text-sm">Cargando reservas...</p>
                              ) : bookings.length === 0 ? (
                                <p className="text-stone-400 text-sm">Sin reservas para esta clase</p>
                              ) : (
                                <div className="space-y-2">
                                  {bookings
                                    .filter((b) => b.status !== "cancelled")
                                    .map((b) => (
                                      <div
                                        key={b.id}
                                        className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5"
                                      >
                                        <div>
                                          <p className="text-sm font-bold text-alma-dark">
                                            {b.profiles?.first_name} {b.profiles?.last_name}
                                          </p>
                                          <p className="text-xs text-stone-400">
                                            {b.profiles?.phone || "Sin teléfono"}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {b.status === "attended" ? (
                                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                                              <CheckCircle size={12} /> Asistió
                                            </span>
                                          ) : b.status === "no_show" ? (
                                            <span className="text-xs text-red-500 bg-red-50 px-2.5 py-1 rounded-full">
                                              No asistió
                                            </span>
                                          ) : b.status === "waitlist" ? (
                                            <span className="text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                                              Lista de espera
                                            </span>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => updateBooking(b.id, "attended")}
                                                disabled={busyKey === b.id}
                                                className="p-1.5 text-stone-400 hover:text-green-600 transition-colors"
                                                title="Marcar asistió"
                                              >
                                                <CheckCircle size={16} />
                                              </button>
                                              <button
                                                onClick={() => updateBooking(b.id, "no_show")}
                                                disabled={busyKey === b.id}
                                                className="p-1.5 text-stone-400 hover:text-red-500 transition-colors"
                                                title="No asistió"
                                              >
                                                <XCircle size={16} />
                                              </button>
                                              <button
                                                onClick={() => updateBooking(b.id, "cancelled")}
                                                disabled={busyKey === b.id}
                                                className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                                                title="Cancelar reserva"
                                              >
                                                <X size={16} />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
