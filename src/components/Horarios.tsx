const horarios = [
  {
    dia: "Lunes",
    clases: [
      { hora: "07:00 AM", nombre: "Reformer Flow", instructora: "Teffi Montes Nieto", duracion: "50 min" },
      { hora: "09:00 AM", nombre: "Reformer Foundation", instructora: "Teffi Montes Nieto", duracion: "50 min" },
    ],
  },
  {
    dia: "Martes",
    clases: [
      { hora: "06:00 AM", nombre: "Reformer Foundation", instructora: "Iris Pinto", duracion: "50 min" },
      { hora: "09:00 AM", nombre: "Reformer Foundation", instructora: "Iris Pinto", duracion: "50 min" },
    ],
  },
  {
    dia: "Miércoles",
    clases: [
      { hora: "06:00 AM", nombre: "Reformer Foundation", instructora: "Mafer Lopez", duracion: "50 min" },
      { hora: "09:00 AM", nombre: "Reformer Flow", instructora: "Mafer Lopez", duracion: "50 min" },
    ],
  },
  {
    dia: "Jueves",
    clases: [
      { hora: "06:00 AM", nombre: "Mat Flow", instructora: "Maca Banda", duracion: "50 min" },
      { hora: "09:00 AM", nombre: "Mat Foundation", instructora: "Maca Banda", duracion: "50 min" },
    ],
  },
  {
    dia: "Viernes",
    clases: [
      { hora: "06:00 AM", nombre: "Reformer Foundation", instructora: "Carlita Meza", duracion: "50 min" },
    ],
  },
  {
    dia: "Sábado",
    clases: [
      { hora: "08:00 AM", nombre: "Mat Foundation", instructora: "Iris Pinto", duracion: "50 min" },
      { hora: "10:00 AM", nombre: "Reformer Flow", instructora: "Iris Pinto", duracion: "50 min" },
    ],
  },
  {
    dia: "Domingo",
    clases: [
      { hora: "08:00 AM", nombre: "Reformer Foundation", instructora: "Teffi Montes Nieto", duracion: "50 min" },
      { hora: "10:00 AM", nombre: "Mat Foundation", instructora: "Teffi Montes Nieto", duracion: "50 min" },
    ],
  },
];

export default function Horarios() {
  return (
    <section id="horarios" className="py-24 bg-alma-light">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs tracking-[0.3em] text-alma-warm text-center mb-4 uppercase">
          Horarios
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-center text-alma-dark mb-16">
          Nuestra semana
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {horarios.map((dia) => (
            <div key={dia.dia} className="bg-white rounded-xl p-5">
              <h3 className="font-[family-name:var(--font-playfair)] text-lg text-alma-dark mb-4 text-center border-b border-stone-100 pb-3">
                {dia.dia}
              </h3>
              <div className="flex flex-col gap-4">
                {dia.clases.map((clase, i) => (
                  <div key={i} className="text-center">
                    <p className="text-sm font-bold text-alma-dark">
                      {clase.nombre}
                    </p>
                    <p className="text-xs text-alma-warm mt-1">
                      {clase.instructora}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      {clase.hora} · {clase.duracion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-stone-400 mt-8">
          * Los horarios pueden variar. Consulta disponibilidad al reservar.
        </p>
      </div>
    </section>
  );
}
