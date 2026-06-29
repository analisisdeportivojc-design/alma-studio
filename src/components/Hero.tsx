import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <Image
        src="/strength.webp"
        alt="Alma Studio - Pilates"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      <div className="relative text-center px-6 max-w-3xl">
        <p className="text-xs tracking-[0.3em] text-white/80 mb-6 uppercase">
          Bienvenida
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl leading-tight text-white mb-6">
          Movimiento que transforma
        </h1>
        <p className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-white/80 mb-4">
          Energía que te cuida
        </p>
        <p className="text-sm tracking-[0.2em] text-white/60 mt-2 mb-10">
          Barré &mdash; Mat &mdash; Reformer
        </p>
        <a
          href="/reserva"
          className="inline-block bg-white text-alma-dark text-xs tracking-[0.2em] px-10 py-4 hover:bg-alma-cream transition-colors"
        >
          RESERVA TU CLASE
        </a>
      </div>
    </section>
  );
}
