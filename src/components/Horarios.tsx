const horarios = [
  { dia: "Lunes", clases: [
    { hora: "07:00", nombre: "Reformer Flow", instructora: "Teffi Montes" },
    { hora: "09:00", nombre: "Reformer Foundation", instructora: "Teffi Montes" },
  ]},
  { dia: "Martes", clases: [
    { hora: "06:00", nombre: "Reformer Foundation", instructora: "Iris Pinto" },
    { hora: "09:00", nombre: "Reformer Foundation", instructora: "Iris Pinto" },
  ]},
  { dia: "Miércoles", clases: [
    { hora: "06:00", nombre: "Reformer Foundation", instructora: "Mafer Lopez" },
    { hora: "09:00", nombre: "Reformer Flow", instructora: "Mafer Lopez" },
  ]},
  { dia: "Jueves", clases: [
    { hora: "06:00", nombre: "Mat Flow", instructora: "Maca Banda" },
    { hora: "09:00", nombre: "Mat Foundation", instructora: "Maca Banda" },
  ]},
  { dia: "Viernes", clases: [
    { hora: "06:00", nombre: "Reformer Foundation", instructora: "Carlita Meza" },
  ]},
  { dia: "Sábado", clases: [
    { hora: "08:00", nombre: "Mat Foundation", instructora: "Iris Pinto" },
    { hora: "10:00", nombre: "Reformer Flow", instructora: "Iris Pinto" },
  ]},
  { dia: "Domingo", clases: [
    { hora: "08:00", nombre: "Reformer Foundation", instructora: "Teffi Montes" },
    { hora: "10:00", nombre: "Mat Foundation", instructora: "Teffi Montes" },
  ]},
];

export default function Horarios() {
  return (
    <section id="horarios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="md:flex md:gap-16 md:items-start mb-12">
          <div className="md:w-2/5 mb-8 md:mb-0">
            <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
              Horarios
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-alma-dark mb-6 uppercase">
              Nuestra
              <br />
              Semana
            </h2>
            <p className="text-stone-500 leading-relaxed mb-8">
              Clases de 50 minutos diseñadas para transformar tu cuerpo y mente. Elige tu horario y reserva tu lugar.
            </p>
            <a
              href="/reserva"
              className="inline-block bg-alma-dark text-white text-sm px-8 py-4 hover:bg-alma-deep transition-colors"
            >
              Ver calendario completo
            </a>
          </div>

          <div className="md:w-3/5">
            <div className="space-y-1">
              {horarios.map((dia) => (
                <details key={dia.dia} className="group border-b border-stone-100">
                  <summary className="flex items-center justify-between py-5 cursor-pointer list-none">
                    <span className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
                      {dia.dia}
                    </span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-stone-400">
                        {dia.clases.length} {dia.clases.length === 1 ? "clase" : "clases"}
                      </span>
                      <svg
                        className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform"
                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className="pb-5 space-y-3">
                    {dia.clases.map((clase, i) => (
                      <div key={i} className="flex items-center gap-6 bg-alma-light rounded-lg px-5 py-4">
                        <span className="text-sm font-mono text-alma-dark w-14">{clase.hora}</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-alma-dark">{clase.nombre}</p>
                          <p className="text-xs text-alma-warm">{clase.instructora}</p>
                        </div>
                        <span className="text-xs text-stone-400">50 min</span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
