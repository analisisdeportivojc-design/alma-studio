import Image from "next/image";

const niveles = [
  {
    nombre: "Alma Foundation",
    subtitulo: "¡Tu punto de inicio!",
    descripcion:
      "Clase diseñada para principiantes o para quienes desean reconectar con su cuerpo desde la base. Trabajamos la alineación, respiración, control y conciencia postural, fortaleciendo tu core y construyendo la técnica esencial del método Pilates.",
    imagen: "/foundation.webp",
  },
  {
    nombre: "Alma Flow",
    subtitulo: "Secuencias fluidas y continuas",
    descripcion:
      "Combina secuencias fluidas y continuas que conectan respiración, fuerza y flexibilidad. Perfecta para quienes buscan energía, equilibrio y una práctica que revitaliza cuerpo y mente.",
    imagen: "/flow.webp",
  },
  {
    nombre: "Alma Strength",
    subtitulo: "Control, fuerza y precisión",
    descripcion:
      "Una clase que integra ejercicios de control, fuerza y precisión, trabajando desde el core hacia todo el cuerpo. Ideal para quienes desean retarse, fortalecer y elevar su práctica con movimientos dinámicos, seguros y conscientes.",
    imagen: "/strength.webp",
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
              className="bg-white rounded-2xl overflow-hidden group"
            >
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={n.imagen}
                  alt={n.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <span className="text-white/60 font-[family-name:var(--font-playfair)] text-5xl">
                    {i + 1}
                  </span>
                </div>
              </div>
              <div className="p-8">
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
