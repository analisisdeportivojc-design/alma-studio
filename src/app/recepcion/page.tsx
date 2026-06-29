"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Search, CheckCircle, XCircle, Clock, Users } from "lucide-react";

interface SessionWithBookings {
  id: string;
  session_date: string;
  status: string;
  classes: {
    name: string;
    start_time: string;
    max_capacity: number;
  };
  bookings: Array<{
    id: string;
    status: string;
    checked_in_at: string | null;
    profiles: {
      first_name: string;
      last_name: string;
      phone: string;
    };
  }>;
}

export default function RecepcionPage() {
  const [sessions, setSessions] = useState<SessionWithBookings[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [checkingIn, setCheckingIn] = useState<string | null>(null);

  useEffect(() => {
    fetchTodaySessions();
  }, []);

  async function fetchTodaySessions() {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", "alma-studio")
      .single();

    if (!business) return;

    const { data } = await supabase
      .from("class_sessions")
      .select(`
        id, session_date, status,
        classes(name, start_time, max_capacity),
        bookings(id, status, checked_in_at, profiles(first_name, last_name, phone))
      `)
      .eq("business_id", business.id)
      .eq("session_date", today)
      .order("session_date");

    setSessions((data as any) || []);
    setLoading(false);
  }

  async function handleCheckIn(bookingId: string) {
    setCheckingIn(bookingId);
    const supabase = createClient();

    await supabase
      .from("bookings")
      .update({
        status: "attended",
        checked_in_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    await fetchTodaySessions();
    setCheckingIn(null);
  }

  async function handleNoShow(bookingId: string) {
    const supabase = createClient();
    await supabase
      .from("bookings")
      .update({ status: "no_show" })
      .eq("id", bookingId);
    await fetchTodaySessions();
  }

  const filteredSessions = sessions.map((s) => ({
    ...s,
    bookings: s.bookings?.filter((b) => {
      if (!search) return b.status !== "cancelled";
      const name = `${b.profiles?.first_name} ${b.profiles?.last_name}`.toLowerCase();
      return name.includes(search.toLowerCase()) && b.status !== "cancelled";
    }),
  }));

  const totalBookings = sessions.reduce(
    (sum, s) => sum + (s.bookings?.filter((b) => b.status === "confirmed" || b.status === "attended").length || 0),
    0
  );
  const totalCheckedIn = sessions.reduce(
    (sum, s) => sum + (s.bookings?.filter((b) => b.status === "attended").length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-alma-light">
      <nav className="bg-alma-deep text-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="font-[family-name:var(--font-playfair)] text-xl">
              Alma Studio
            </Link>
            <span className="text-alma-warm text-xs ml-3 uppercase tracking-wider">
              Recepción
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cuenta" className="text-xs text-stone-400 hover:text-white">
              Mi Cuenta
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
              Check-in del día
            </h1>
            <p className="text-stone-500 text-sm mt-1">
              {new Date().toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm text-center">
              <p className="font-bold text-alma-dark text-xl">{totalBookings}</p>
              <p className="text-xs text-stone-400">Reservas</p>
            </div>
            <div className="bg-white rounded-xl px-5 py-3 shadow-sm text-center">
              <p className="font-bold text-green-600 text-xl">{totalCheckedIn}</p>
              <p className="text-xs text-stone-400">Check-ins</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar alumna por nombre..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-alma-gold"
          />
        </div>

        {/* Sessions */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-6 h-6 border-2 border-alma-warm border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center shadow-sm">
            <Clock size={40} className="text-stone-200 mx-auto mb-4" />
            <p className="text-stone-400">No hay clases programadas hoy</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="bg-alma-dark text-white px-6 py-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{session.classes?.name}</h3>
                    <p className="text-stone-300 text-sm">
                      {session.classes?.start_time?.slice(0, 5)} · {session.classes?.max_capacity} lugares
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} />
                    <span>
                      {session.bookings?.filter((b) => b.status === "attended").length || 0}
                      /{session.bookings?.filter((b) => b.status !== "cancelled").length || 0}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-stone-50">
                  {session.bookings?.length === 0 ? (
                    <p className="text-stone-300 text-sm text-center py-6">
                      Sin reservas
                    </p>
                  ) : (
                    session.bookings?.map((booking) => (
                      <div
                        key={booking.id}
                        className={`px-6 py-4 flex items-center justify-between ${
                          booking.status === "attended" ? "bg-green-50/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              booking.status === "attended"
                                ? "bg-green-100 text-green-600"
                                : "bg-alma-cream text-alma-dark"
                            }`}
                          >
                            {booking.profiles?.first_name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-alma-dark">
                              {booking.profiles?.first_name} {booking.profiles?.last_name}
                            </p>
                            <p className="text-xs text-stone-400">
                              {booking.profiles?.phone || "Sin teléfono"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.status === "attended" ? (
                            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                              <CheckCircle size={14} />
                              Check-in {booking.checked_in_at
                                ? new Date(booking.checked_in_at).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })
                                : ""}
                            </span>
                          ) : booking.status === "no_show" ? (
                            <span className="text-xs text-red-500 bg-red-50 px-3 py-1.5 rounded-full">
                              No asistió
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => handleCheckIn(booking.id)}
                                disabled={checkingIn === booking.id}
                                className="flex items-center gap-1 text-xs bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle size={14} />
                                {checkingIn === booking.id ? "..." : "Check-in"}
                              </button>
                              <button
                                onClick={() => handleNoShow(booking.id)}
                                className="flex items-center gap-1 text-xs text-stone-400 px-3 py-2 rounded-lg hover:bg-stone-100 transition-colors"
                              >
                                <XCircle size={14} />
                                No vino
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
