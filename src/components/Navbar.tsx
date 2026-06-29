"use client";

import { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const navLinks = [
  { href: "#disciplinas", label: "Disciplinas" },
  { href: "#metodo", label: "El Método" },
  { href: "#instructoras", label: "Instructoras" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#contacto", label: "Contacto" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-2xl tracking-wide text-alma-dark"
          >
            Alma Studio
          </Link>

          <div className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[13px] text-stone-500 hover:text-alma-dark transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/login"
              className="text-[13px] text-stone-400 hover:text-alma-dark transition-colors"
            >
              Login
            </Link>
            <Link
              href="/reserva"
              className="border border-alma-dark text-alma-dark text-[13px] px-6 py-2.5 rounded-full hover:bg-alma-dark hover:text-white transition-all"
            >
              Reserva Ahora
            </Link>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="lg:hidden text-alma-dark"
            aria-label="Menu"
          >
            <svg width="24" height="16" viewBox="0 0 24 16" fill="none">
              <line y1="1" x2="24" y2="1" stroke="currentColor" strokeWidth="1.5" />
              <line y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.5" />
              <line y1="15" x2="24" y2="15" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Fullscreen menu */}
      {open && (
        <div className="fixed inset-0 z-[60] bg-alma-deep flex flex-col animate-fade-in">
          <div className="flex items-center justify-between px-6 h-20">
            <span className="font-[family-name:var(--font-playfair)] text-2xl text-white">
              Alma Studio
            </span>
            <button onClick={() => setOpen(false)} className="text-white">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center px-10 gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-[family-name:var(--font-playfair)] text-3xl text-white/80 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-stone-400 text-sm mt-4"
            >
              Login
            </Link>
          </div>

          <div className="px-10 pb-10">
            <Link
              href="/reserva"
              onClick={() => setOpen(false)}
              className="block w-full border border-white text-white text-center py-4 text-sm tracking-[0.15em] hover:bg-white hover:text-alma-deep transition-all"
            >
              RESERVA TU CLASE
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
