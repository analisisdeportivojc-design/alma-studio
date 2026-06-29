import Image from "next/image";

const disciplinas = [
  {
    nombre: "Barré",
    descripcion:
      "Es una disciplina que combina ballet, pilates y fitness para tonificar y estilizar el cuerpo. Mejora la postura, la fuerza y la flexibilidad a través de movimientos pequeños, precisos y de alta intensidad, al ritmo de la música.",
    imagen: "/barre.webp",
  },
  {
    nombre: "Pilates Mat",
    descripcion:
      "Es una práctica que se realiza con mat en el suelo, utilizando el peso del propio cuerpo y accesorios. Se enfoca en fortalecer el core, mejorar la postura, la flexibilidad y la consciencia corporal.",
    imagen: "/mat.webp",
  },
  {
    nombre: "Pilates Reformer",
    descripcion:
      "Tonifica y fortalece el cuerpo de forma integral, mejorando la postura, la flexibilidad y el control del movimiento. Gracias al trabajo con el reformer, cada ejercicio es más preciso, dinámico y efectivo para conectar fuerza, estabilidad y bienestar.",
    imagen: "/reformer.webp",
  },
];

export default function Disciplinas() {
  return (
    <section id="disciplinas" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs tracking-[0.3em] text-alma-warm text-center mb-4 uppercase">
          Nuestras disciplinas
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-center text-alma-dark mb-16">
          Encuentra tu práctica
        </h2>

        <div className="grid md:grid-cols-3 gap-10">
          {disciplinas.map((d) => (
            <div
              key={d.nombre}
              className="group text-center"
            >
              <div className="relative w-56 h-56 mx-auto mb-6 rounded-full overflow-hidden">
                <Image
                  src={d.imagen}
                  alt={d.nombre}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark mb-4">
                {d.nombre}
              </h3>
              <p className="text-stone-500 leading-relaxed text-sm max-w-xs mx-auto">
                {d.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
