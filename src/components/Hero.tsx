export default function Hero() {
  return (
    <section id="inicio" className="relative h-screen flex items-center overflow-hidden">
      <video
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-xl">
          <p className="text-alma-warm text-xs tracking-[0.3em] mb-6 uppercase animate-fade-up">
            Magdalena del Mar, Lima
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl leading-[1.1] text-white mb-6 animate-fade-up animate-delay-200">
            MOVIMIENTO
            <br />
            QUE
            <br />
            TRANSFORMA
          </h1>
          <p className="text-white/70 text-lg mb-10 animate-fade-up animate-delay-400">
            Barré · Pilates Mat · Reformer
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-600">
            <a
              href="/reserva"
              className="bg-white text-alma-dark text-sm tracking-[0.1em] px-8 py-4 hover:bg-alma-cream transition-colors text-center"
            >
              Reserva tu clase
            </a>
            <a
              href="#metodo"
              className="border border-white/40 text-white text-sm tracking-[0.1em] px-8 py-4 hover:bg-white/10 transition-colors text-center"
            >
              Conoce el método
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg width="20" height="30" viewBox="0 0 20 30" fill="none">
          <rect x="1" y="1" width="18" height="28" rx="9" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2" fill="white" fillOpacity="0.6" />
        </svg>
      </div>
    </section>
  );
}
