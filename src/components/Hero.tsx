export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center bg-alma-cream"
    >
      <div className="absolute inset-0 bg-[url('/hero-placeholder.jpg')] bg-cover bg-center opacity-20" />
      <div className="relative text-center px-6 max-w-3xl">
        <p className="text-xs tracking-[0.3em] text-alma-warm mb-6 uppercase">
          Bienvenida
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl leading-tight text-alma-dark mb-6">
          Movimiento que transforma
        </h1>
        <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-stone-500 mb-4">
          Energía que te cuida
        </p>
        <p className="text-sm tracking-[0.2em] text-alma-warm mt-2 mb-10">
          Barré &mdash; Mat &mdash; Reformer
        </p>
        <a
          href="/reserva"
          className="inline-block bg-alma-dark text-white text-xs tracking-[0.2em] px-10 py-4 hover:bg-stone-700 transition-colors"
        >
          RESERVA TU CLASE
        </a>
      </div>
    </section>
  );
}
