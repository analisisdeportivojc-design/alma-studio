const pilares = [
  {
    num: "01",
    titulo: "Movimiento",
    descripcion:
      "Técnica precisa y control corporal. Cada clase está diseñada para trabajar tu cuerpo de forma segura, progresiva y consciente.",
  },
  {
    num: "02",
    titulo: "Consciencia",
    descripcion:
      "Respiración, alineación y conexión mente-cuerpo. No solo te mueves, entiendes por qué te mueves.",
  },
  {
    num: "03",
    titulo: "Bienestar",
    descripcion:
      "Más allá del ejercicio. Alma es un espacio para reconectar contigo misma, liberar estrés y transformar tu energía.",
  },
];

export default function Metodo() {
  return (
    <section id="metodo" className="bg-alma-deep text-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="md:flex md:gap-16 md:items-start">
          <div className="md:w-2/5 mb-12 md:mb-0 md:sticky md:top-32">
            <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
              Nuestro enfoque
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl leading-tight mb-6 uppercase">
              El Método
              <br />
              Alma
            </h2>
            <p className="text-stone-400 leading-relaxed">
              Tres pilares que guían cada clase, cada respiración
              y cada momento en nuestro studio.
            </p>
          </div>

          <div className="md:w-3/5">
            {pilares.map((p, i) => (
              <div
                key={p.num}
                className={`py-10 ${i < pilares.length - 1 ? "border-b border-white/10" : ""}`}
              >
                <div className="flex items-start gap-6">
                  <span className="font-[family-name:var(--font-playfair)] text-5xl text-alma-gold/30">
                    {p.num}
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl mb-3">
                      {p.titulo}
                    </h3>
                    <p className="text-stone-400 leading-relaxed max-w-md">
                      {p.descripcion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
