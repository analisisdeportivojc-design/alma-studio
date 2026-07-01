"use client";

import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";

interface PendingRating {
  session_id: string;
  class_name: string;
  session_date: string;
  instructor_id: string | null;
}

export default function PendingRatingModal({ businessId }: { businessId: string }) {
  const [pending, setPending] = useState<PendingRating | null>(null);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch("/api/class-ratings?pending=true")
      .then((r) => r.json())
      .then((d) => {
        if (d.pending?.length > 0) setPending(d.pending[0]);
      })
      .catch(() => {});
  }, []);

  if (!pending) return null;

  const dateLabel = new Date(pending.session_date + "T12:00:00").toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });

  async function submit() {
    if (!rating || !pending) return;
    setSubmitting(true);
    await fetch("/api/class-ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: pending.session_id,
        instructor_id: pending.instructor_id,
        business_id: businessId,
        rating,
        comment: comment || undefined,
      }),
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => setPending(null), 2000);
  }

  const labels = ["", "Malo", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setPending(null)} />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-alma-dark text-white px-6 py-5">
          <button
            onClick={() => setPending(null)}
            className="absolute top-4 right-4 w-7 h-7 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X size={14} />
          </button>
          <p className="text-xs tracking-[0.2em] text-alma-gold uppercase mb-1">¿Cómo estuvo?</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-xl">{pending.class_name}</h2>
          <p className="text-stone-400 text-xs mt-1 capitalize">{dateLabel}</p>
        </div>

        {/* Body */}
        <div className="p-6">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">🙏</div>
              <p className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark">¡Gracias por tu valoración!</p>
              <p className="text-sm text-stone-400 mt-1">Tu opinión ayuda a la comunidad</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-stone-500 mb-5 text-center">
                Valora tu experiencia en esta clase
              </p>

              {/* Stars */}
              <div className="flex justify-center gap-3 mb-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHovered(n)}
                    onMouseLeave={() => setHovered(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      className={
                        n <= (hovered || rating)
                          ? "text-amber-400 fill-amber-400"
                          : "text-stone-200"
                      }
                    />
                  </button>
                ))}
              </div>

              {/* Label */}
              <p className="text-center text-sm font-bold text-alma-warm mb-5 h-5">
                {labels[hovered || rating]}
              </p>

              {/* Comment */}
              {rating > 0 && (
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Comparte tu experiencia (opcional)..."
                  rows={3}
                  className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-alma-gold resize-none mb-4"
                />
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setPending(null)}
                  className="flex-1 py-3 rounded-xl border border-stone-200 text-stone-400 text-sm hover:bg-stone-50 transition-colors"
                >
                  Ahora no
                </button>
                <button
                  onClick={submit}
                  disabled={!rating || submitting}
                  className="flex-1 py-3 rounded-xl bg-alma-dark text-white text-sm font-bold hover:bg-alma-dark/90 transition-colors disabled:opacity-40"
                >
                  {submitting ? "Enviando..." : "Enviar valoración"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
