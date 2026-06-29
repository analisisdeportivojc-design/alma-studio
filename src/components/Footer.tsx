export default function Footer() {
  return (
    <footer className="bg-alma-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl mb-4">
              Alma Studio
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              Movimiento que transforma.
              <br />
              Energía que te cuida.
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4 text-alma-warm uppercase">
              Navegación
            </h4>
            <div className="flex flex-col gap-2">
              <a href="#inicio" className="text-stone-400 text-sm hover:text-white transition-colors">Inicio</a>
              <a href="#disciplinas" className="text-stone-400 text-sm hover:text-white transition-colors">Disciplinas</a>
              <a href="#paquetes" className="text-stone-400 text-sm hover:text-white transition-colors">Paquetes</a>
              <a href="#horarios" className="text-stone-400 text-sm hover:text-white transition-colors">Horarios</a>
              <a href="#contacto" className="text-stone-400 text-sm hover:text-white transition-colors">Contacto</a>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-[0.2em] mb-4 text-alma-warm uppercase">
              Síguenos
            </h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/almastudio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="https://tiktok.com/@almastudio"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.88a8.21 8.21 0 004.76 1.52V6.94a4.85 4.85 0 01-1-.25z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-stone-500 text-xs">
            © {new Date().getFullYear()} Alma Studio — Todos los derechos reservados.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-stone-500 text-xs hover:text-white transition-colors">
              Términos y condiciones
            </a>
            <a href="#" className="text-stone-500 text-xs hover:text-white transition-colors">
              Política de privacidad
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
