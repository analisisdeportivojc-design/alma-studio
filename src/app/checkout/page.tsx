"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Shield, CreditCard, Building2 } from "lucide-react";

interface PackageData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  total_classes: number;
  duration_days: number;
  freeze_days: number;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get("paquete");

  const [pkg, setPkg] = useState<PackageData | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (packageId) {
        const { data } = await supabase
          .from("packages")
          .select("*")
          .eq("id", packageId)
          .single();
        setPkg(data);
      }
      setLoading(false);
    }
    load();
  }, [packageId]);

  async function handlePayment() {
    if (!user || !pkg) return;
    setProcessing(true);

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        package_id: pkg.id,
        payment_method: paymentMethod,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = `/checkout/exito?subscription=${data.subscription_id}`;
    } else {
      alert(data.error || "Error procesando el pago");
      setProcessing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-alma-light flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-alma-warm border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-alma-light flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md">
          <p className="text-stone-500 mb-4">Inicia sesión para comprar</p>
          <Link
            href={`/login`}
            className="inline-block bg-alma-dark text-white text-xs tracking-[0.15em] px-8 py-3"
          >
            INICIAR SESIÓN
          </Link>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-alma-light flex items-center justify-center px-6">
        <div className="bg-white rounded-2xl p-10 text-center max-w-md">
          <p className="text-stone-500 mb-4">Paquete no encontrado</p>
          <Link href="/#paquetes" className="text-alma-gold text-sm">
            Ver paquetes disponibles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-alma-light">
      <nav className="bg-white border-b border-stone-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark"
          >
            Alma Studio
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-400">
            <Shield size={14} />
            Pago seguro
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark text-center mb-10">
          Checkout
        </h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Order summary */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs uppercase tracking-wider text-stone-500 mb-4">
                Resumen
              </h2>
              <div className="border-b border-stone-100 pb-4 mb-4">
                <h3 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
                  {pkg.name}
                </h3>
                {pkg.description && (
                  <p className="text-sm text-stone-500 mt-1">
                    {pkg.description}
                  </p>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Clases</span>
                  <span className="text-alma-dark">{pkg.total_classes} presenciales</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Vigencia</span>
                  <span className="text-alma-dark">{pkg.duration_days} días</span>
                </div>
                {pkg.freeze_days > 0 && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Congelamiento</span>
                    <span className="text-alma-dark">{pkg.freeze_days} días</span>
                  </div>
                )}
              </div>
              <div className="border-t border-stone-100 mt-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-alma-dark">Total</span>
                  <span className="font-[family-name:var(--font-playfair)] text-2xl text-alma-dark">
                    S/.{pkg.price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xs uppercase tracking-wider text-stone-500 mb-6">
                Método de pago
              </h2>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === "card"
                      ? "border-alma-gold bg-alma-light"
                      : "border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <CreditCard
                    size={24}
                    className={
                      paymentMethod === "card"
                        ? "text-alma-gold"
                        : "text-stone-400"
                    }
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-alma-dark">
                      Tarjeta de crédito / débito
                    </p>
                    <p className="text-xs text-stone-400">
                      Visa, Mastercard, American Express
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod("transfer")}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === "transfer"
                      ? "border-alma-gold bg-alma-light"
                      : "border-stone-100 hover:border-stone-200"
                  }`}
                >
                  <Building2
                    size={24}
                    className={
                      paymentMethod === "transfer"
                        ? "text-alma-gold"
                        : "text-stone-400"
                    }
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-alma-dark">
                      Transferencia bancaria
                    </p>
                    <p className="text-xs text-stone-400">
                      Yape, Plin o transferencia directa
                    </p>
                  </div>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="bg-alma-light rounded-xl p-4 mb-6">
                  <p className="text-sm text-stone-500 text-center">
                    🔒 Al confirmar, serás redirigido a la pasarela segura de
                    Culqi para completar el pago.
                  </p>
                </div>
              )}

              {paymentMethod === "transfer" && (
                <div className="bg-alma-light rounded-xl p-4 mb-6 space-y-2">
                  <p className="text-sm font-bold text-alma-dark">
                    Datos para transferencia:
                  </p>
                  <p className="text-sm text-stone-600">
                    BCP: 191-12345678-0-12
                  </p>
                  <p className="text-sm text-stone-600">
                    Yape / Plin: +51 951 251 796
                  </p>
                  <p className="text-xs text-stone-400 mt-2">
                    Envía el comprobante por WhatsApp para activar tu plan.
                  </p>
                </div>
              )}

              <div className="border-t border-stone-100 pt-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-stone-500">
                  <div className="w-8 h-8 bg-alma-cream rounded-full flex items-center justify-center">
                    {user.user_metadata?.first_name?.[0] || "U"}
                  </div>
                  <div>
                    <p className="text-alma-dark font-bold">
                      {user.user_metadata?.first_name}{" "}
                      {user.user_metadata?.last_name}
                    </p>
                    <p className="text-xs">{user.email}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-alma-dark text-white py-4 text-xs tracking-[0.2em] uppercase hover:bg-stone-700 transition-colors disabled:opacity-50"
              >
                {processing
                  ? "Procesando..."
                  : paymentMethod === "card"
                    ? `PAGAR S/.${pkg.price}`
                    : "CONFIRMAR PEDIDO"}
              </button>

              <p className="text-center text-xs text-stone-400 mt-4">
                Al comprar aceptas los{" "}
                <a href="#" className="underline">
                  términos y condiciones
                </a>{" "}
                de Alma Studio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alma-light flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-alma-warm border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
