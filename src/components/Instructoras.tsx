import Image from "next/image";

const instructoras = [
  {
    nombre: "Teffi Montes Nieto",
    rol: "Instructora Principal",
    especialidad: "Reformer Flow · Foundation",
    bio: "Apasionada por el movimiento consciente y la conexión mente-cuerpo. Cada clase es una oportunidad para transformar tu energía.",
    imagen: "/flow.webp",
    dias: "Lunes · Domingo",
  },
  {
    nombre: "Iris Pinto",
    rol: "Instructora",
    especialidad: "Reformer Foundation · Mat",
    bio: "Enfocada en la técnica y la precisión. Te guía paso a paso para que cada movimiento cuente.",
    imagen: "/foundation.webp",
    dias: "Martes · Sábado",
  },
  {
    nombre: "Mafer Lopez",
    rol: "Instructora",
    especialidad: "Reformer Foundation · Flow",
    bio: "Combina fuerza y fluidez en cada secuencia. Sus clases te retan y te inspiran.",
    imagen: "/reformer.webp",
    dias: "Miércoles",
  },
  {
    nombre: "Maca Banda",
    rol: "Instructora",
    especialidad: "Mat Flow · Foundation",
    bio: "Especialista en Pilates Mat. Te enseña a usar tu propio cuerpo como herramienta de transformación.",
    imagen: "/mat.webp",
    dias: "Jueves",
  },
  {
    nombre: "Carlita Meza",
    rol: "Instructora",
    especialidad: "Reformer Foundation",
    bio: "Dedicada a crear un espacio seguro donde cada alumna pueda crecer a su ritmo.",
    imagen: "/barre.webp",
    dias: "Viernes",
  },
];

export default function Instructoras() {
  return (
    <section id="instructoras" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
            Nuestro equipo
          </p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-alma-dark uppercase">
            Instructoras
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructoras.map((inst) => (
            <div key={inst.nombre} className="group">
              <div className="relative h-80 rounded-lg overflow-hidden mb-5">
                <Image
                  src={inst.imagen}
                  alt={inst.nombre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <p className="text-white/80 text-sm leading-relaxed">
                    {inst.bio}
                  </p>
                </div>
              </div>
              <h3 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
                {inst.nombre}
              </h3>
              <p className="text-alma-gold text-sm mt-1">{inst.especialidad}</p>
              <p className="text-stone-400 text-xs mt-1">{inst.dias}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
