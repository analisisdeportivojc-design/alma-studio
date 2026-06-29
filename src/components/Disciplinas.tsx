import Image from "next/image";

const disciplinas = [
  {
    nombre: "Barré",
    descripcion:
      "Combina ballet, pilates y fitness para tonificar y estilizar el cuerpo. Mejora la postura, la fuerza y la flexibilidad a través de movimientos pequeños, precisos y de alta intensidad, al ritmo de la música.",
    imagen: "/barre.webp",
    cta: "Explorar Barré",
  },
  {
    nombre: "Pilates Mat",
    descripcion:
      "Práctica en el suelo utilizando el peso del propio cuerpo y accesorios. Fortalece el core, mejora la postura, la flexibilidad y la consciencia corporal.",
    imagen: "/mat.webp",
    cta: "Explorar Mat",
    reverse: true,
  },
  {
    nombre: "Pilates Reformer",
    descripcion:
      "Tonifica y fortalece el cuerpo de forma integral. Gracias al reformer, cada ejercicio es más preciso, dinámico y efectivo para conectar fuerza, estabilidad y bienestar.",
    imagen: "/reformer.webp",
    cta: "Explorar Reformer",
  },
];

export default function Disciplinas() {
  return (
    <section id="disciplinas" className="py-0">
      {disciplinas.map((d, i) => (
        <div
          key={d.nombre}
          className={`flex flex-col ${i % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"} min-h-[70vh]`}
        >
          <div className="md:w-1/2 relative h-[50vh] md:h-auto">
            <Image
              src={d.imagen}
              alt={d.nombre}
              fill
              className="object-cover"
            />
          </div>
          <div
            className={`md:w-1/2 flex items-center px-8 md:px-16 lg:px-24 py-16 ${
              i % 2 !== 0 ? "bg-alma-cream" : "bg-white"
            }`}
          >
            <div className="max-w-md">
              <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
                Disciplina {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-alma-dark mb-6 uppercase">
                {d.nombre}
              </h2>
              <p className="text-stone-500 leading-relaxed mb-8">{d.descripcion}</p>
              <a
                href="/reserva"
                className="inline-block border border-alma-dark text-alma-dark text-sm px-8 py-3 hover:bg-alma-dark hover:text-white transition-all"
              >
                {d.cta}
              </a>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
