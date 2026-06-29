"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface PackageItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  total_classes: number;
  duration_days: number;
  freeze_days: number;
  is_featured: boolean;
}

function durationLabel(days: number) {
  if (days <= 30) return "1 mes";
  if (days <= 60) return "2 meses";
  if (days <= 120) return "4 meses";
  return `${Math.round(days / 30)} meses`;
}

export default function Paquetes() {
  const [packages, setPackages] = useState<PackageItem[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: business } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", "alma-studio")
        .single();

      if (!business) return;

      const { data } = await supabase
        .from("packages")
        .select("*")
        .eq("business_id", business.id)
        .eq("is_active", true)
        .order("sort_order");

      setPackages(data || []);
    }
    load();
  }, []);

  return (
    <section id="paquetes" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-xs tracking-[0.3em] text-alma-warm text-center mb-4 uppercase">
          Paquetes
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-center text-alma-dark mb-16">
          Elige tu plan
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {packages.map((p) => (
            <div
              key={p.id}
              className={`rounded-2xl p-8 flex flex-col items-center text-center transition-transform hover:-translate-y-1 ${
                p.is_featured
                  ? "bg-alma-dark text-white ring-2 ring-alma-gold"
                  : "bg-alma-light"
              }`}
            >
              {p.is_featured && (
                <span className="text-[10px] tracking-[0.2em] bg-alma-gold text-white px-3 py-1 rounded-full mb-4 uppercase">
                  Popular
                </span>
              )}
              <p
                className={`text-xs tracking-wider mb-1 ${p.is_featured ? "text-stone-300" : "text-alma-warm"}`}
              >
                {p.description || "Mat & Barré"}
              </p>
              <h3
                className={`font-[family-name:var(--font-playfair)] text-xl mb-4 ${p.is_featured ? "text-white" : "text-alma-dark"}`}
              >
                {p.name}
              </h3>
              <div className="mb-4">
                <span className="text-xs align-top">S/.</span>
                <span className="font-[family-name:var(--font-playfair)] text-4xl">
                  {p.price}
                </span>
              </div>
              <div
                className={`text-sm mb-2 ${p.is_featured ? "text-stone-300" : "text-stone-500"}`}
              >
                {p.total_classes}{" "}
                {p.total_classes === 1 ? "clase" : "clases"} presenciales
              </div>
              <div
                className={`text-xs mb-6 ${p.is_featured ? "text-stone-400" : "text-stone-400"}`}
              >
                Duración: {durationLabel(p.duration_days)}
              </div>
              {p.freeze_days > 0 && (
                <div className="text-xs text-alma-gold mb-4">
                  Congelamiento: {p.freeze_days} días
                </div>
              )}
              <a
                href={`/checkout?paquete=${p.id}`}
                className={`mt-auto w-full py-3 text-xs tracking-[0.15em] text-center transition-colors block ${
                  p.is_featured
                    ? "bg-white text-alma-dark hover:bg-stone-100"
                    : "bg-alma-dark text-white hover:bg-stone-700"
                }`}
              >
                COMPRAR
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
