import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Disciplinas from "@/components/Disciplinas";
import Metodo from "@/components/Metodo";
import Instructoras from "@/components/Instructoras";
import Niveles from "@/components/Niveles";
import Paquetes from "@/components/Paquetes";
import ClasePrueba from "@/components/ClasePrueba";
import Horarios from "@/components/Horarios";
import Contacto from "@/components/Contacto";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Disciplinas />
        <Metodo />
        <Instructoras />
        <Niveles />
        <Paquetes />
        <ClasePrueba />
        <Horarios />
        <Contacto />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
