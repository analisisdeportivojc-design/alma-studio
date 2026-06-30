"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegistroContent() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(refCode);
  const [referralSource, setReferralSource] = useState("");
  const [objective, setObjective] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          referral_source: referralSource || null,
          objective: objective || null,
        },
      },
    });

    if (error) {
      setError(error.message || JSON.stringify(error));
      setLoading(false);
      return;
    }

    if (data?.user?.identities?.length === 0) {
      setError("Este email ya está registrado. Intenta iniciar sesión.");
      setLoading(false);
      return;
    }

    // Send welcome email (non-blocking)
    fetch("/api/notifications/welcome", { method: "POST" }).catch(() => {});

    // Apply referral code if provided
    if (referralCode.trim()) {
      fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: referralCode.trim() }),
      }).catch(() => {});
    }

    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-alma-light flex items-center justify-center px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl p-10 shadow-sm">
            <div className="text-5xl mb-4">✓</div>
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark mb-4">
              ¡Registro exitoso!
            </h2>
            <p className="text-stone-500 text-sm mb-6">
              Revisa tu correo electrónico para confirmar tu cuenta.
            </p>
            <Link
              href="/login"
              className="inline-block bg-alma-dark text-white py-3 px-8 text-xs tracking-[0.15em] uppercase hover:bg-stone-700 transition-colors"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alma-light flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark"
          >
            Alma Studio
          </Link>
          <p className="text-stone-500 text-sm mt-2">Crea tu cuenta</p>
        </div>

        <form
          onSubmit={handleRegister}
          className="bg-white rounded-2xl p-8 shadow-sm space-y-5"
        >
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="firstName"
                className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
              >
                Nombre
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
              >
                Apellido
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              Teléfono
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              placeholder="+51 999 999 999"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div>
            <label
              htmlFor="referralSource"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              ¿Cómo nos encontraste? <span className="text-stone-300">(opcional)</span>
            </label>
            <select
              id="referralSource"
              value={referralSource}
              onChange={(e) => setReferralSource(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors bg-white"
            >
              <option value="">— Selecciona una opción —</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="google">Google</option>
              <option value="referido">Me lo recomendó alguien</option>
              <option value="walk_in">Pasé por el estudio</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="objective"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              ¿Cuál es tu objetivo? <span className="text-stone-300">(opcional)</span>
            </label>
            <select
              id="objective"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors bg-white"
            >
              <option value="">— Selecciona una opción —</option>
              <option value="bienestar">Bienestar general</option>
              <option value="perdida_peso">Pérdida de peso</option>
              <option value="rehabilitacion">Rehabilitación / lesión</option>
              <option value="deporte">Rendimiento deportivo</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="referral"
              className="block text-xs tracking-wider text-stone-500 mb-2 uppercase"
            >
              Código de referido <span className="text-stone-300">(opcional)</span>
            </label>
            <input
              id="referral"
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold transition-colors"
              placeholder="Ej: MARI1234"
            />
            {referralCode && (
              <p className="text-xs text-alma-gold mt-1">
                ¡Ambas ganarán 1 clase gratis!
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-alma-dark text-white py-3 text-xs tracking-[0.15em] uppercase hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-alma-gold hover:text-alma-dark transition-colors font-bold"
          >
            Inicia sesión
          </Link>
        </p>

        <p className="text-center mt-4">
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            ← Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alma-light flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-alma-warm border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <RegistroContent />
    </Suspense>
  );
}
