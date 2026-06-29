const niveles = [
  {
    nombre: "Alma Foundation",
    subtitulo: "¡Tu punto de inicio!",
    descripcion:
      "Clase diseñada para principiantes o para quienes desean reconectar con su cuerpo desde la base. Trabajamos la alineación, respiración, control y conciencia postural, fortaleciendo tu core y construyendo la técnica esencial del método Pilates.",
    color: "bg-alma-cream",
  },
  {
    nombre: "Alma Flow",
    subtitulo: "Secuencias fluidas y continuas",
    descripcion:
      "Combina secuencias fluidas y continuas que conectan respiración, fuerza y flexibilidad. Perfecta para quienes buscan energía, equilibrio y una práctica que revitaliza cuerpo y mente.",
    color: "bg-alma-light",
  },
  {
    nombre: "Alma Strength",
    subtitulo: "Control, fuerza y precisión",
    descripcion:
      "Una clase que integra ejercicios de control, fuerza y precisión, trabajando desde el core hacia todo el cuerpo. Ideal para quienes desean retarse, fortalecer y elevar su práctica con movimientos dinámicos, seguros y conscientes.",
    color: "bg-alma-cream",
  },
];

export default function Niveles() {
  return (
    <section className="py-24 bg-alma-light">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs tracking-[0.3em] text-alma-warm text-center mb-4 uppercase">
          Niveles
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-center text-alma-dark mb-16">
          Tu camino en Alma
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {niveles.map((n, i) => (
            <div
              key={n.nombre}
              className={`${n.color} p-10 rounded-2xl relative overflow-hidden`}
            >
              <div className="text-alma-warm/30 font-[family-name:var(--font-playfair)] text-8xl absolute -top-4 -right-2 select-none">
                {i + 1}
              </div>
              <div className="relative">
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark mb-2">
                  {n.nombre}
                </h3>
                <p className="text-alma-gold text-sm font-bold mb-4">
                  {n.subtitulo}
                </p>
                <p className="text-stone-500 leading-relaxed text-sm">
                  {n.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
