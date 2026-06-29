"use client";

import { useState } from "react";

export default function AplicarReferido() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage(null);

    const res = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage({ text: data.error, type: "error" });
    } else {
      setMessage({ text: data.message, type: "success" });
      setCode("");
      setTimeout(() => window.location.reload(), 2000);
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-alma-light rounded-lg p-4 mt-4">
      <p className="text-xs text-stone-500 uppercase tracking-wider mb-3">
        ¿Te recomendó una amiga? Ingresa su código
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Ej: MARI1234"
          className="flex-1 px-4 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold uppercase"
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="bg-alma-dark text-white text-xs tracking-wider px-5 py-2.5 hover:bg-alma-deep transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "APLICAR"}
        </button>
      </div>
      {message && (
        <p
          className={`text-xs mt-2 ${
            message.type === "success" ? "text-green-600" : "text-red-500"
          }`}
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
