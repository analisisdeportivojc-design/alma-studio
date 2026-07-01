"use client";

import { useState, useEffect } from "react";
import { X, Clock, Users, Star, AtSign, ChevronRight } from "lucide-react";

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

interface InstructorDetail {
  id: string;
  bio: string | null;
  specialties: string[] | null;
  photo_url: string | null;
  video_urls: string[] | null;
  instagram_handle: string | null;
  tagline: string | null;
}

interface Props {
  session: Session;
  businessId: string;
  myBooking: { id: string; status: string } | null;
  onClose: () => void;
  onBook: (classId: string, date: string) => void;
  onCancel: (bookingId: string, classId: string, date: string) => void;
  busy: boolean;
  user: any;
}

function Stars({ value, interactive, onChange }: { value: number; interactive?: boolean; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button"
          onClick={() => interactive && onChange?.(n)}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <Star size={20} className={n <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-stone-200"} />
        </button>
      ))}
    </div>
  );
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

export default function SessionDetailPanel({ session, businessId, myBooking, onClose, onBook, onCancel, busy, user }: Props) {
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [myRating, setMyRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);

  const isFull = session.available <= 0;
  const isPast = session.date < new Date().toISOString().split("T")[0];
  const isCancelled = session.status === "cancelled";
  const isBooked = myBooking?.status === "confirmed";
  const isWaitlisted = myBooking?.status === "waitlist";

  useEffect(() => {
    if (session.instructor?.id) {
      fetch(`/api/instructors/${session.instructor.id}`)
        .then((r) => r.json())
        .then((d) => { setInstructor(d.instructor); setAvgRating(d.avg_rating); });
    }
  }, [session.instructor?.id]);

  async function submitRating() {
    if (!myRating || !user) return;
    setSubmittingRating(true);
    await fetch("/api/instructor-ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instructor_id: session.instructor!.id, business_id: businessId, rating: myRating, comment: ratingComment || undefined }),
    });
    setSubmittingRating(false);
    setRatingSubmitted(true);
  }

  const dateLabel = new Date(session.date + "T12:00:00").toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  const timeLabel = (() => {
    const [h, m] = session.start_time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${h12}:${m} ${ampm}`;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with instructor photo bg */}
        <div className="relative bg-alma-dark text-white">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
            <X size={16} />
          </button>

          <div className="flex gap-6 p-6">
            {/* Instructor photo */}
            <div className="shrink-0">
              {session.instructor?.photo_url || instructor?.photo_url ? (
                <img
                  src={instructor?.photo_url || session.instructor?.photo_url || ""}
                  alt={session.instructor?.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center text-3xl font-bold text-white/60">
                  {session.instructor?.name?.[0] || "?"}
                </div>
              )}
            </div>

            {/* Class + instructor info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {session.discipline && (
                  <span className="text-xs bg-alma-gold/20 text-alma-gold px-2 py-0.5 rounded-full">{session.discipline}</span>
                )}
                {session.level && (
                  <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">{session.level}</span>
                )}
              </div>
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl leading-tight">{session.name}</h2>

              {session.instructor && (
                <div className="mt-2">
                  <p className="text-stone-300 text-sm font-bold">{session.instructor.name}</p>
                  {instructor?.tagline && <p className="text-alma-gold text-xs mt-0.5">{instructor.tagline}</p>}
                  {avgRating !== null && (
                    <div className="flex items-center gap-2 mt-1">
                      <Stars value={Math.round(avgRating)} />
                      <span className="text-xs text-stone-400">{avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-5 mt-3 text-sm text-stone-300">
                <span className="flex items-center gap-1.5"><Clock size={13} />{timeLabel} · {session.duration_minutes} min</span>
                <span className="flex items-center gap-1.5">
                  <Users size={13} />
                  {session.booked_count}/{session.max_capacity}
                  <span className={isFull ? "text-amber-400" : "text-green-400"}>
                    · {isFull ? "Llena" : `${session.available} libres`}
                  </span>
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 capitalize">{dateLabel}</p>
            </div>
          </div>

          {/* Capacity bar */}
          <div className="px-6 pb-4">
            <div className="w-full bg-white/10 rounded-full h-1">
              <div
                className={`h-1 rounded-full transition-all ${isFull ? "bg-amber-400" : "bg-green-400"}`}
                style={{ width: `${Math.min((session.booked_count / session.max_capacity) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Instructor bio */}
          {instructor?.bio && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-2">Sobre la instructora</h3>
              <p className="text-sm text-stone-600 leading-relaxed">{instructor.bio}</p>
            </div>
          )}

          {/* Specialties */}
          {instructor?.specialties && instructor.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {instructor.specialties.map((s) => (
                <span key={s} className="text-xs bg-alma-light text-alma-dark px-3 py-1.5 rounded-full">{s}</span>
              ))}
            </div>
          )}

          {/* Instagram */}
          {instructor?.instagram_handle && (
            <a href={`https://instagram.com/${instructor.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-stone-500 hover:text-alma-warm transition-colors">
              <AtSign size={14} />{instructor.instagram_handle}
            </a>
          )}

          {/* Videos */}
          {instructor?.video_urls && instructor.video_urls.length > 0 && (
            <div>
              <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Videos</h3>
              <div className="grid gap-3">
                {instructor.video_urls.map((url, i) => {
                  const ytId = getYouTubeId(url);
                  return ytId ? (
                    <div key={i} className="rounded-xl overflow-hidden aspect-video">
                      <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                    </div>
                  ) : (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-alma-gold hover:underline">
                      Ver video <ChevronRight size={14} />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Rate instructor */}
          {user && session.instructor && (
            <div className="border-t border-stone-100 pt-6">
              <h3 className="text-xs uppercase tracking-wider text-stone-400 mb-3">Califica a la instructora</h3>
              {ratingSubmitted ? (
                <p className="text-sm text-green-600">¡Gracias por tu calificación!</p>
              ) : (
                <div className="space-y-3">
                  <Stars value={myRating} interactive onChange={setMyRating} />
                  {myRating > 0 && (
                    <>
                      <textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)}
                        placeholder="Comentario opcional..." rows={2}
                        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none" />
                      <button onClick={submitRating} disabled={submittingRating}
                        className="text-xs bg-alma-dark text-white px-4 py-2 rounded-lg hover:bg-alma-dark/90 transition-colors disabled:opacity-50">
                        {submittingRating ? "Enviando..." : "Enviar calificación"}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        {!isPast && !isCancelled && (
          <div className="p-5 border-t border-stone-100 bg-white">
            {isBooked ? (
              <div className="flex gap-3">
                <div className="flex-1 py-3 rounded-xl bg-green-50 text-green-700 text-sm font-bold text-center">✓ Reservada</div>
                <button onClick={() => onCancel(myBooking!.id, session.class_id, session.date)} disabled={busy}
                  className="px-5 py-3 rounded-xl border border-red-200 text-red-500 text-sm hover:bg-red-50 transition-colors disabled:opacity-50">
                  {busy ? "..." : "Cancelar"}
                </button>
              </div>
            ) : isWaitlisted ? (
              <button onClick={() => onCancel(myBooking!.id, session.class_id, session.date)} disabled={busy}
                className="w-full py-3 rounded-xl border border-amber-200 text-amber-600 text-sm hover:bg-amber-50 transition-colors disabled:opacity-50">
                {busy ? "Procesando..." : "En lista de espera · Salir"}
              </button>
            ) : (
              <button onClick={() => onBook(session.class_id, session.date)} disabled={busy}
                className="w-full py-3 rounded-xl bg-alma-dark text-white text-sm font-bold hover:bg-alma-dark/90 transition-colors disabled:opacity-50">
                {busy ? "Reservando..." : isFull ? "Entrar a lista de espera" : "Reservar esta clase"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
