"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Search, CreditCard, Banknote, ArrowLeftRight, X, Loader2, CheckCircle } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  created_at: string;
  external_id: string | null;
  subscription_id: string | null;
  profiles: { first_name: string; last_name: string } | null;
  subscriptions: { packages: { name: string } | null } | null;
}

interface Client {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface Package {
  id: string;
  name: string;
  price: number;
  total_classes: number;
  duration_days: number;
}

const METHOD_ICON: Record<string, React.ReactNode> = {
  cash: <Banknote size={14} />,
  transfer: <ArrowLeftRight size={14} />,
  culqi: <CreditCard size={14} />,
  yape: <CreditCard size={14} />,
  plin: <CreditCard size={14} />,
};

const METHOD_LABEL: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
  culqi: "Culqi",
  yape: "Yape",
  plin: "Plin",
};

export default function AdminPagosPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Modal state
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedPackage, setSelectedPackage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [customAmount, setCustomAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  async function fetchPayments() {
    const res = await fetch("/api/admin/payments");
    const data = await res.json();
    setPayments(data.payments || []);
    setLoading(false);
  }

  async function openModal() {
    setShowModal(true);
    setSaveError(null);
    setSelectedClient("");
    setSelectedPackage("");
    setPaymentMethod("transfer");
    setCustomAmount("");
    setNotes("");

    const [clientsRes, packagesRes] = await Promise.all([
      fetch("/api/admin/clients"),
      fetch("/api/packages"),
    ]);
    const cd = await clientsRes.json();
    const pd = await packagesRes.json();
    setClients(
      (cd.clients || []).map((c: any) => ({
        user_id: c.user_id,
        first_name: c.first_name,
        last_name: c.last_name,
      }))
    );
    setPackages(
      (pd.packages || []).filter((p: any) => p.is_active).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        total_classes: p.total_classes,
        duration_days: p.duration_days,
      }))
    );
  }

  const selectedPkg = packages.find((p) => p.id === selectedPackage);

  async function handleSave() {
    if (!selectedClient || !selectedPackage || !paymentMethod) return;
    setSaving(true);
    setSaveError(null);

    const res = await fetch("/api/admin/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: selectedClient,
        package_id: selectedPackage,
        payment_method: paymentMethod,
        amount: customAmount ? parseFloat(customAmount) : selectedPkg?.price,
        notes: notes || undefined,
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setSaveError(data.error || "Error al registrar");
      return;
    }

    setShowModal(false);
    fetchPayments();
  }

  const filtered = useMemo(() => {
    if (!search) return payments;
    const q = search.toLowerCase();
    return payments.filter((p) =>
      `${p.profiles?.first_name} ${p.profiles?.last_name} ${p.subscriptions?.packages?.name}`
        .toLowerCase()
        .includes(q)
    );
  }, [payments, search]);

  const totalCompleted = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-alma-dark">
            Pagos
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {payments.length} registros · S/.{totalCompleted.toFixed(0)} recaudado total
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 bg-alma-dark text-white text-xs tracking-wider px-5 py-3 hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} />
          REGISTRAR PAGO
        </button>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o paquete..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-alma-gold"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Cliente</th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Paquete</th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Monto</th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Método</th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Fecha</th>
              <th className="text-left text-xs text-stone-500 uppercase tracking-wider px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-400">Cargando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-stone-300 text-sm">
                  {search ? "Sin resultados" : "Sin pagos registrados"}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="border-b border-stone-50 hover:bg-stone-50">
                  <td className="px-6 py-4 text-sm font-bold text-alma-dark">
                    {p.profiles?.first_name} {p.profiles?.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600">
                    {p.subscriptions?.packages?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-alma-dark">
                    S/.{Number(p.amount).toFixed(0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-xs text-stone-500">
                      {METHOD_ICON[p.payment_method] || <CreditCard size={14} />}
                      {METHOD_LABEL[p.payment_method] || p.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-500">
                    {new Date(p.created_at).toLocaleDateString("es-PE")}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      p.status === "completed" ? "bg-green-50 text-green-600" :
                      p.status === "failed" ? "bg-red-50 text-red-500" :
                      p.status === "refunded" ? "bg-amber-50 text-amber-600" :
                      "bg-stone-100 text-stone-400"
                    }`}>
                      {p.status === "completed" ? "Completado" :
                       p.status === "failed" ? "Fallido" :
                       p.status === "refunded" ? "Reembolsado" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="font-[family-name:var(--font-playfair)] text-xl text-alma-dark">
                Registrar pago
              </h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-alma-dark">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Cliente</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                >
                  <option value="">— Seleccionar cliente —</option>
                  {clients.map((c) => (
                    <option key={c.user_id} value={c.user_id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Paquete</label>
                <select
                  value={selectedPackage}
                  onChange={(e) => {
                    setSelectedPackage(e.target.value);
                    setCustomAmount("");
                  }}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                >
                  <option value="">— Seleccionar paquete —</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — S/.{p.price} · {p.total_classes} clases · {p.duration_days} días
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">Método de pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                  >
                    <option value="transfer">Transferencia</option>
                    <option value="yape">Yape</option>
                    <option value="plin">Plin</option>
                    <option value="cash">Efectivo</option>
                    <option value="culqi">Culqi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">
                    Monto {selectedPkg ? `(precio: S/.${selectedPkg.price})` : ""}
                  </label>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder={selectedPkg ? `${selectedPkg.price}` : "0"}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-stone-500 mb-1 block">
                  Notas <span className="text-stone-300">(opcional)</span>
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Pagó con descuento por referido"
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-alma-gold"
                />
              </div>

              {selectedPkg && selectedClient && (
                <div className="bg-alma-light rounded-lg px-4 py-3 text-sm text-stone-600">
                  <CheckCircle size={14} className="inline text-alma-gold mr-1.5" />
                  Se activará <strong>{selectedPkg.name}</strong> con {selectedPkg.total_classes} clases
                  por {selectedPkg.duration_days} días a partir de hoy.
                </div>
              )}

              {saveError && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-stone-500 hover:text-alma-dark transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !selectedClient || !selectedPackage}
                className="flex items-center gap-2 px-5 py-2 bg-alma-dark text-white text-sm rounded-lg hover:bg-alma-dark/90 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                Confirmar pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
