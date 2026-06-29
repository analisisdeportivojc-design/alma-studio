import Link from "next/link";

export default function CheckoutExitoPage() {
  return (
    <div className="min-h-screen bg-alma-light flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark mb-3">
            ¡Compra exitosa!
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            Tu plan está activo. Ya puedes reservar tus clases.
          </p>

          <div className="space-y-3">
            <Link
              href="/reserva"
              className="block w-full bg-alma-dark text-white py-3 text-xs tracking-[0.15em] uppercase text-center hover:bg-stone-700 transition-colors"
            >
              RESERVAR MI PRIMERA CLASE
            </Link>
            <Link
              href="/cuenta"
              className="block w-full border border-stone-200 text-alma-dark py-3 text-xs tracking-[0.15em] uppercase text-center hover:bg-stone-50 transition-colors"
            >
              IR A MI CUENTA
            </Link>
          </div>
        </div>

        <p className="text-center mt-6">
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
