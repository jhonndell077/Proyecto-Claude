"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi, planApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface PlanForm {
  name: string;
  description: string;
  price: number;
  maxProducts: number;
  commissionRate: number;
  features: string[];
  isHighlighted: boolean;
}

const DEFAULT_FORM: PlanForm = { name: "", description: "", price: 0, maxProducts: -1, commissionRate: 15, features: [], isHighlighted: false };

export default function AdminPlansPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanForm>(DEFAULT_FORM);
  const [featureInput, setFeatureInput] = useState("");

  const { data: plans } = useQuery({
    queryKey: ["plans"],
    queryFn: () => planApi.list().then((r) => r.data.data),
  });

  const createPlan = useMutation({
    mutationFn: (data: PlanForm) => adminApi.createPlan(data),
    onSuccess: () => { toast.success("Plan creado"); qc.invalidateQueries({ queryKey: ["plans"] }); setShowForm(false); setForm(DEFAULT_FORM); },
  });

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, featureInput.trim()] }));
    setFeatureInput("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-6 flex items-center justify-between">
        <h1 className="text-xl font-black">Planes de Membresía</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
          <Plus size={16} />Nuevo plan
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {showForm && (
          <div className="card">
            <h2 className="font-bold text-gray-800 mb-4">Crear nuevo plan</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Nombre</label><input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Precio mensual (RD$)</label><input type="number" className="input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Comisión (%)</label><input type="number" className="input" value={form.commissionRate} onChange={(e) => setForm((f) => ({ ...f, commissionRate: +e.target.value }))} /></div>
              <div><label className="text-sm font-medium text-gray-700 block mb-1">Máx. productos (-1 = ilimitado)</label><input type="number" className="input" value={form.maxProducts} onChange={(e) => setForm((f) => ({ ...f, maxProducts: +e.target.value }))} /></div>
              <div className="md:col-span-2"><label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label><textarea className="input h-20 resize-none" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Características</label>
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="Agregar característica..." value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addFeature()} />
                  <button onClick={addFeature} className="btn-primary px-4">Agregar</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.features.map((f, i) => (
                    <span key={i} className="bg-brand-50 text-brand-700 text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      {f}<button onClick={() => setForm((ff) => ({ ...ff, features: ff.features.filter((_, idx) => idx !== i) }))}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isHighlighted} onChange={(e) => setForm((f) => ({ ...f, isHighlighted: e.target.checked }))} className="accent-brand-500" />
                <span className="text-sm font-medium text-gray-700">Plan destacado</span>
              </label>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => createPlan.mutate(form)} disabled={createPlan.isPending} className="btn-primary px-6">{createPlan.isPending ? "Creando..." : "Crear plan"}</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancelar</button>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4">
          {(plans ?? []).map((plan: { id: string; name: string; price: number; commissionRate: number; maxProducts: number; features: string[]; isHighlighted: boolean; status: string; _count?: { businesses: number } }) => (
            <div key={plan.id} className={`card border-2 ${plan.isHighlighted ? "border-brand-400 shadow-md" : "border-gray-100"}`}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-black text-lg">{plan.name}</h3>
                <span className={`badge ${plan.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>{plan.status === "ACTIVE" ? "Activo" : "Inactivo"}</span>
              </div>
              <p className="text-2xl font-black text-brand-500 mb-1">{plan.price === 0 ? "Gratis" : formatCurrency(plan.price)}<span className="text-sm font-normal text-gray-400">/mes</span></p>
              <p className="text-sm text-gray-500 mb-1">Comisión: <strong>{plan.commissionRate}%</strong></p>
              <p className="text-sm text-gray-500 mb-3">Productos: <strong>{plan.maxProducts === -1 ? "Ilimitados" : plan.maxProducts}</strong></p>
              <ul className="space-y-1 mb-4">
                {plan.features.map((f: string) => <li key={f} className="text-xs text-gray-600 flex items-center gap-1.5">✓ {f}</li>)}
              </ul>
              <p className="text-xs text-gray-400">{plan._count?.businesses ?? 0} comercios suscritos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
