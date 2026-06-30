"use client";

import { useEffect, useRef } from "react";

export default function Hero() {
  const videoMobileRef = useRef<HTMLVideoElement>(null);
  const videoDesktopRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const playAll = () => {
      [videoMobileRef, videoDesktopRef].forEach((ref) => {
        if (ref.current) {
          ref.current.muted = true;
          ref.current.play().catch(() => {});
        }
      });
    };

    playAll();

    // iOS requiere interacción del usuario — se dispara al primer toque
    document.addEventListener("touchstart", playAll, { once: true });
    document.addEventListener("click", playAll, { once: true });

    return () => {
      document.removeEventListener("touchstart", playAll);
      document.removeEventListener("click", playAll);
    };
  }, []);

  return (
    <section id="inicio" className="relative h-[100svh] flex items-center overflow-hidden">
      <video
        ref={videoMobileRef}
        src="/hero-mobile.mp4"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover md:hidden"
      />
      <video
        ref={videoDesktopRef}
        src="/hero.mp4"
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

      <div className="relative z-10 w-full px-6 absolute bottom-16 left-0">
        <p className="text-alma-warm text-[10px] tracking-[0.3em] mb-4 uppercase">
          Magdalena del Mar, Lima
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-7xl leading-[1.05] text-white mb-4">
          MOVIMIENTO
          <br />
          QUE
          <br />
          TRANSFORMA
        </h1>
        <p className="text-white/70 text-sm mb-8">
          Barré · Pilates Mat · Reformer
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="/reserva"
            className="bg-white text-alma-dark text-xs tracking-[0.1em] px-8 py-4 hover:bg-alma-cream transition-colors text-center"
          >
            Reserva tu clase
          </a>
          <a
            href="#metodo"
            className="border border-white/40 text-white text-xs tracking-[0.1em] px-8 py-4 hover:bg-white/10 transition-colors text-center"
          >
            Conoce el método
          </a>
        </div>
      </div>
    </section>
  );
}
