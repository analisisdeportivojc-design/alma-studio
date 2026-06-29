import Link from "next/link";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark"
          >
            Alma Studio
          </Link>
          <Link
            href="/"
            className="text-xs text-stone-400 hover:text-alma-dark transition-colors"
          >
            ← Volver al inicio
          </Link>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-16">{children}</div>
      <footer className="border-t border-stone-100 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap gap-6 justify-center text-xs text-stone-400">
          <Link href="/legal/terminos" className="hover:text-alma-dark transition-colors">
            Términos y condiciones
          </Link>
          <Link href="/legal/privacidad" className="hover:text-alma-dark transition-colors">
            Política de privacidad
          </Link>
          <Link href="/legal/libro-reclamaciones" className="hover:text-alma-dark transition-colors">
            Libro de reclamaciones
          </Link>
        </div>
      </footer>
    </div>
  );
}
