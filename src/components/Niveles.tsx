import Image from "next/image";

const niveles = [
  {
    nombre: "Foundation",
    subtitulo: "Tu punto de inicio",
    descripcion:
      "Para principiantes o quienes desean reconectar con su cuerpo desde la base. Alineación, respiración, control y conciencia postural.",
    imagen: "/foundation.webp",
  },
  {
    nombre: "Flow",
    subtitulo: "Secuencias fluidas",
    descripcion:
      "Secuencias continuas que conectan respiración, fuerza y flexibilidad. Energía, equilibrio y una práctica que revitaliza.",
    imagen: "/flow.webp",
  },
  {
    nombre: "Strength",
    subtitulo: "Fuerza y precisión",
    descripcion:
      "Control, fuerza y precisión desde el core. Para quienes desean retarse y elevar su práctica con movimientos dinámicos.",
    imagen: "/strength.webp",
  },
];

export default function Niveles() {
  return (
    <section className="py-24 bg-alma-light">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase text-center">
          Tu camino
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-center text-alma-dark mb-16 uppercase">
          Niveles
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {niveles.map((n, i) => (
            <div key={n.nombre} className="group relative overflow-hidden rounded-lg cursor-pointer">
              <div className="relative h-[500px]">
                <Image
                  src={n.imagen}
                  alt={n.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <p className="text-alma-warm text-xs tracking-[0.2em] mb-2 uppercase">
                  Nivel {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-2 uppercase">
                  {n.nombre}
                </h3>
                <p className="text-white/60 text-sm mb-3">{n.subtitulo}</p>
                <p className="text-white/50 text-sm leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 max-h-0 group-hover:max-h-40 overflow-hidden">
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
