"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function PopupBienvenida() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const visto = sessionStorage.getItem("popup-visto");
    if (!visto) {
      setTimeout(() => setVisible(true), 1200);
    }
  }, []);

  function cerrar() {
    sessionStorage.setItem("popup-visto", "1");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      {/* Fondo oscuro */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={cerrar}
      />

      {/* Modal */}
      <div className="relative z-10 bg-white w-full max-w-sm md:max-w-md rounded-xl overflow-hidden shadow-2xl animate-fade-up">
        {/* Botón cerrar */}
        <button
          onClick={cerrar}
          className="absolute top-3 right-3 z-20 bg-white/80 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
          aria-label="Cerrar"
        >
          ✕
        </button>

        {/* Foto */}
        <div className="relative w-full h-56 md:h-64">
          <Image
            src="/fototicekt.jpg"
            alt="Clase de prueba gratis Alma Studio"
            fill
            className="object-cover"
          />
        </div>

        {/* Contenido */}
        <div className="px-8 py-7 text-center" style={{ backgroundColor: "#f5f0eb" }}>
          <p className="text-xs tracking-[0.25em] text-alma-gold uppercase mb-2">
            Oferta especial
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-alma-dark mb-3 leading-tight">
            Clase de Prueba
            <br />
            <span className="text-alma-gold">Gratis</span>
          </h2>
          <p className="text-stone-500 text-sm mb-6 leading-relaxed">
            Tu primera clase sin costo.<br />Conoce el método Alma y transforma tu cuerpo.
          </p>

          <Link
            href="/reserva"
            onClick={cerrar}
            className="block w-full bg-alma-dark text-white text-xs tracking-[0.15em] uppercase py-4 hover:bg-stone-700 transition-colors mb-3"
          >
            Reservar mi clase gratis
          </Link>

          <button
            onClick={cerrar}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors underline underline-offset-2"
          >
            No gracias, seguir navegando
          </button>
        </div>
      </div>
    </div>
  );
}
