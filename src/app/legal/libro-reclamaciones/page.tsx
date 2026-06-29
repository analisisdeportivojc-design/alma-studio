"use client";

import { useState } from "react";

export default function LibroReclamacionesPage() {
  const [form, setForm] = useState({
    tipo: "reclamo",
    nombre: "",
    dni: "",
    email: "",
    telefono: "",
    direccion: "",
    detalle: "",
    pedido: "",
  });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fecha = new Date().toLocaleDateString("es-PE");
    const msg = encodeURIComponent(
      `📋 LIBRO DE RECLAMACIONES - ALMA STUDIO\n\n` +
      `Fecha: ${fecha}\n` +
      `Tipo: ${form.tipo === "reclamo" ? "Reclamo" : "Queja"}\n\n` +
      `👤 DATOS DEL CONSUMIDOR\n` +
      `Nombre: ${form.nombre}\n` +
      `DNI: ${form.dni}\n` +
      `Email: ${form.email}\n` +
      `Teléfono: ${form.telefono}\n` +
      `Dirección: ${form.direccion}\n\n` +
      `📝 DETALLE\n${form.detalle}\n\n` +
      `✅ PEDIDO DEL CONSUMIDOR\n${form.pedido}`
    );
    window.open(`https://wa.me/51951251796?text=${msg}`, "_blank");
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark mb-3">
          Reclamo registrado
        </h2>
        <p className="text-stone-500 text-sm max-w-md mx-auto mb-6">
          Tu {form.tipo} ha sido enviado. Nos comunicaremos contigo en un plazo
          máximo de 30 días calendario conforme a lo establecido por el Código de
          Protección y Defensa del Consumidor.
        </p>
        <a
          href="/"
          className="inline-block bg-alma-dark text-white text-xs tracking-[0.15em] px-8 py-3"
        >
          VOLVER AL INICIO
        </a>
      </div>
    );
  }

  return (
    <div>
      <p className="text-alma-warm text-xs tracking-[0.3em] uppercase mb-2">
        Conforme al Art. 150° de la Ley N.° 29571
      </p>
      <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark mb-8">
        Libro de Reclamaciones
      </h1>

      {/* Datos de la empresa */}
      <div className="bg-alma-light rounded-xl p-6 mb-8 grid sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Razón Social</p>
          <p className="text-sm text-alma-dark font-bold">ALMA ESPRESSO CORPORACIÓN S.A.C.</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider">RUC</p>
          <p className="text-sm text-alma-dark font-bold">20615055141</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Dirección</p>
          <p className="text-sm text-alma-dark">Jr. Cusco 865, Dpto. 403, Magdalena del Mar, Lima</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Sucursal</p>
          <p className="text-sm text-alma-dark">Jirón Castilla 758, Magdalena del Mar, Lima</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo */}
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">
            1. Tipo de solicitud
          </p>
          <div className="flex gap-4">
            <label
              className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-colors ${
                form.tipo === "reclamo"
                  ? "border-alma-gold bg-alma-light"
                  : "border-stone-200"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="reclamo"
                checked={form.tipo === "reclamo"}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="sr-only"
              />
              <p className="font-bold text-alma-dark text-sm">Reclamo</p>
              <p className="text-xs text-stone-400 mt-1">
                Disconformidad con el servicio
              </p>
            </label>
            <label
              className={`flex-1 p-4 rounded-lg border-2 cursor-pointer text-center transition-colors ${
                form.tipo === "queja"
                  ? "border-alma-gold bg-alma-light"
                  : "border-stone-200"
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value="queja"
                checked={form.tipo === "queja"}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="sr-only"
              />
              <p className="font-bold text-alma-dark text-sm">Queja</p>
              <p className="text-xs text-stone-400 mt-1">
                Malestar o descontento con la atención
              </p>
            </label>
          </div>
        </div>

        {/* Datos del consumidor */}
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">
            2. Datos del consumidor
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-400 mb-1">Nombre completo *</label>
              <input
                type="text"
                required
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">DNI / CE *</label>
              <input
                type="text"
                required
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Correo electrónico *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Teléfono *</label>
              <input
                type="tel"
                required
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-stone-400 mb-1">Dirección *</label>
              <input
                type="text"
                required
                value={form.direccion}
                onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
              />
            </div>
          </div>
        </div>

        {/* Detalle */}
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">
            3. Detalle del {form.tipo}
          </p>
          <textarea
            required
            rows={4}
            value={form.detalle}
            onChange={(e) => setForm({ ...form, detalle: e.target.value })}
            placeholder="Describa los hechos con el mayor detalle posible..."
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none"
          />
        </div>

        {/* Pedido */}
        <div>
          <p className="text-xs text-stone-500 uppercase tracking-wider mb-3 font-bold">
            4. Pedido del consumidor
          </p>
          <textarea
            required
            rows={3}
            value={form.pedido}
            onChange={(e) => setForm({ ...form, pedido: e.target.value })}
            placeholder="¿Qué solución espera?"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold resize-none"
          />
        </div>

        <div className="bg-alma-light rounded-lg p-4">
          <p className="text-xs text-stone-500">
            📋 Conforme al Código de Protección y Defensa del Consumidor (Ley N.° 29571),
            la empresa se compromete a dar respuesta a su {form.tipo} en un plazo máximo
            de <strong>30 días calendario</strong>. La formulación del reclamo no impide
            acudir a otras vías de solución de controversias ni es requisito previo para
            interponer una denuncia ante el INDECOPI.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-alma-dark text-white py-4 text-xs tracking-[0.15em] uppercase hover:bg-alma-deep transition-colors"
        >
          ENVIAR {form.tipo.toUpperCase()}
        </button>
      </form>
    </div>
  );
}
