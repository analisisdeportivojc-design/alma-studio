import { MapPin, Phone, Mail } from "lucide-react";

const faqs = [
  { q: "¿Necesito experiencia previa?", a: "No. Alma Foundation está diseñada para principiantes. Nuestras instructoras te guían desde cero." },
  { q: "¿Cuánto dura cada clase?", a: "Todas las clases duran 50 minutos." },
  { q: "¿Qué necesito llevar?", a: "Solo medias antideslizantes. Nosotras proporcionamos todo el equipo." },
  { q: "¿Puedo tomar clases si estoy embarazada?", a: "Consulta con tu médico primero. Algunas clases son aptas con adaptaciones." },
  { q: "¿Cómo reservo una clase?", a: "Desde nuestra web, en la sección de reservas. Selecciona el día, la clase y confirma." },
  { q: "¿Cuántas personas hay por clase?", a: "Máximo 6 personas en Reformer y 10 en Mat, para atención personalizada." },
];

export default function Contacto() {
  return (
    <section id="contacto" className="py-24 bg-alma-cream">
      <div className="max-w-7xl mx-auto px-6">
        <div className="md:flex md:gap-16">
          {/* Contact info */}
          <div className="md:w-2/5 mb-12 md:mb-0">
            <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
              Contacto
            </p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-alma-dark mb-8 uppercase">
              Estamos aquí
              <br />
              para ti
            </h2>

            <div className="space-y-6 mb-10">
              <div className="flex items-start gap-4">
                <MapPin size={18} className="text-alma-gold mt-0.5 shrink-0" />
                <p className="text-stone-600 text-sm">
                  Jirón Castilla 758, Magdalena del Mar, Lima
                </p>
              </div>
              <div className="flex items-start gap-4">
                <Phone size={18} className="text-alma-gold mt-0.5 shrink-0" />
                <a href="tel:+51951251796" className="text-stone-600 text-sm hover:text-alma-dark transition-colors">
                  +51 951 251 796
                </a>
              </div>
              <div className="flex items-start gap-4">
                <Mail size={18} className="text-alma-gold mt-0.5 shrink-0" />
                <a href="mailto:contacto@almastudio.com.pe" className="text-stone-600 text-sm hover:text-alma-dark transition-colors">
                  contacto@almastudio.com.pe
                </a>
              </div>
            </div>

            <a
              href="https://wa.me/51951251796?text=Hola%2C%20quiero%20información%20sobre%20las%20clases%20en%20Alma%20Studio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-alma-dark text-white px-8 py-4 text-sm hover:bg-alma-deep transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos por WhatsApp
            </a>

            <div className="mt-10 rounded-lg overflow-hidden h-48">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.5!2d-77.08!3d-12.09!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDA1JzI0LjAiUyA3N8KwMDQnNDguMCJX!5e0!3m2!1ses!2spe!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Ubicación Alma Studio"
              />
            </div>
          </div>

          {/* FAQs */}
          <div className="md:w-3/5">
            <p className="text-alma-warm text-xs tracking-[0.3em] mb-4 uppercase">
              Preguntas frecuentes
            </p>
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark mb-8">
              FAQs
            </h3>
            <div className="space-y-1">
              {faqs.map((faq) => (
                <details key={faq.q} className="group border-b border-stone-200">
                  <summary className="flex items-center justify-between py-5 cursor-pointer list-none text-alma-dark text-sm font-bold">
                    {faq.q}
                    <svg
                      className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform shrink-0 ml-4"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <p className="pb-5 text-stone-500 text-sm leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
