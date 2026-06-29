import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alma Studio | Barré · Pilates Mat · Reformer",
  description:
    "Movimiento que transforma. Energía que te cuida. Studio de Pilates en Magdalena del Mar, Lima.",
  keywords: [
    "pilates",
    "barré",
    "reformer",
    "mat",
    "magdalena del mar",
    "lima",
    "studio",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${lato.variable}`}>
      <body className="min-h-screen bg-white text-stone-800 font-[family-name:var(--font-lato)] antialiased">
        {children}
      </body>
    </html>
  );
}
