"use client";

import { useState } from "react";

export default function ClasePrueba() {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msg = encodeURIComponent(
      `Hola, soy ${form.nombre}. Quiero agendar mi clase prueba gratuita.\nEmail: ${form.email}\nTeléfono: ${form.telefono}`
    );
    window.open(`https://wa.me/51951251796?text=${msg}`, "_blank");
    setSent(true);
  }

  return (
    <section id="clase-prueba" className="py-24 bg-alma-deep text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="md:flex md:gap-16 md:items-center">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
              Sin compromiso
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl leading-tight mb-6 uppercase">
              Tu primera
              <br />
              clase es
              <br />
              <span className="text-alma-gold">gratis</span>
            </h2>
            <p className="text-stone-400 leading-relaxed max-w-md">
              Ven a conocer Alma Studio. Prueba una clase sin costo y descubre
              por qué el movimiento consciente puede transformar tu vida.
              Sin compromiso, sin presión.
            </p>
          </div>

          <div className="md:w-1/2">
            {sent ? (
              <div className="bg-white/5 backdrop-blur rounded-2xl p-10 text-center">
                <div className="text-5xl mb-4">✓</div>
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl mb-3">
                  ¡Te esperamos!
                </h3>
                <p className="text-stone-400 text-sm">
                  Te redirigimos a WhatsApp para coordinar tu clase prueba.
                  Si no se abrió, escríbenos al +51 951 251 796.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white/5 backdrop-blur rounded-2xl p-8 md:p-10 space-y-5"
              >
                <p className="text-sm text-stone-300 mb-2">
                  2 pasos y listo.
                </p>
                <div>
                  <label className="block text-xs tracking-wider text-stone-400 mb-2 uppercase">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-sm focus:outline-none focus:border-alma-gold transition-colors placeholder:text-stone-600"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-stone-400 mb-2 uppercase">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-sm focus:outline-none focus:border-alma-gold transition-colors placeholder:text-stone-600"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-wider text-stone-400 mb-2 uppercase">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    required
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    className="w-full bg-transparent border-b border-white/20 pb-3 text-white text-sm focus:outline-none focus:border-alma-gold transition-colors placeholder:text-stone-600"
                    placeholder="+51 999 999 999"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-alma-gold text-white py-4 text-sm tracking-[0.15em] uppercase hover:bg-alma-warm transition-colors mt-4"
                >
                  Agendar mi clase gratis
                </button>
                <p className="text-xs text-stone-500 text-center">
                  Te contactaremos por WhatsApp para coordinar
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
