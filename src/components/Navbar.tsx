"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "#inicio", label: "INICIO" },
  { href: "#disciplinas", label: "DISCIPLINAS" },
  { href: "#paquetes", label: "PAQUETES" },
  { href: "#horarios", label: "HORARIOS" },
  { href: "#contacto", label: "CONTACTO" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        <Link
          href="/"
          className="font-[family-name:var(--font-playfair)] text-2xl tracking-wide text-alma-dark"
        >
          Alma Studio
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs tracking-[0.2em] text-stone-500 hover:text-alma-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/reserva"
            className="bg-alma-dark text-white text-xs tracking-[0.15em] px-6 py-3 hover:bg-stone-700 transition-colors"
          >
            RESERVA
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-alma-dark"
          aria-label="Menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white border-t border-stone-100 px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm tracking-[0.15em] text-stone-500 hover:text-alma-dark transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a
            href="/reserva"
            onClick={() => setOpen(false)}
            className="bg-alma-dark text-white text-xs tracking-[0.15em] px-6 py-3 text-center hover:bg-stone-700 transition-colors"
          >
            RESERVA
          </a>
        </div>
      )}
    </nav>
  );
}
