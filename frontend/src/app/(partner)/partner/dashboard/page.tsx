"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessApi, orderApi } from "@/lib/api";
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLOR } from "@/lib/utils";
import { BarChart2, Package, Power, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function PartnerDashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["partner-dashboard"],
    queryFn: () => businessApi.getDashboard().then((r) => r.data.data),
  });

  const toggleMutation = useMutation({
    mutationFn: () => businessApi.toggle(),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries({ queryKey: ["partner-dashboard"] });
    },
  });

  const acceptOrder = useMutation({
    mutationFn: (id: string) => orderApi.updateStatus(id, "ACCEPTED"),
    onSuccess: () => { toast.success("Pedido aceptado"); qc.invalidateQueries({ queryKey: ["partner-dashboard"] }); },
  });

  const prepareOrder = useMutation({
    mutationFn: (id: string) => orderApi.updateStatus(id, "PREPARING"),
    onSuccess: () => { toast.success("En preparación"); qc.invalidateQueries({ queryKey: ["partner-dashboard"] }); },
  });

  const readyOrder = useMutation({
    mutationFn: (id: string) => orderApi.updateStatus(id, "READY"),
    onSuccess: () => { toast.success("¡Listo para recoger!"); qc.invalidateQueries({ queryKey: ["partner-dashboard"] }); },
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  const { business, stats, pendingOrders } = data ?? {};

  const NEXT_ACTION: Record<string, { label: string; fn: (id: string) => void; color: string }> = {
    RECEIVED: { label: "Aceptar", fn: (id) => acceptOrder.mutate(id), color: "btn-primary" },
    ACCEPTED: { label: "En preparación", fn: (id) => prepareOrder.mutate(id), color: "bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-3 py-1.5 rounded-xl text-xs" },
    PREPARING: { label: "Marcar listo", fn: (id) => readyOrder.mutate(id), color: "bg-green-500 hover:bg-green-600 text-white font-semibold px-3 py-1.5 rounded-xl text-xs" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-500 text-white px-4 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">{business?.name}</h1>
            <p className="text-brand-100 text-sm">{business?.status === "ACTIVE" ? "✅ Aprobado" : "⏳ Pendiente"}</p>
          </div>
          {business?.status === "ACTIVE" && (
            <button
              onClick={() => toggleMutation.mutate()}
              disabled={toggleMutation.isPending}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${business.isOpen ? "bg-white/20 hover:bg-white/30" : "bg-white text-brand-600 hover:bg-brand-50"}`}
            >
              <Power size={16} />
              {business.isOpen ? "Cerrar tienda" : "Abrir tienda"}
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Package, label: "Pedidos hoy", value: stats?.ordersToday ?? 0, color: "text-blue-500" },
            { icon: TrendingUp, label: "Ventas hoy", value: formatCurrency(stats?.grossToday ?? 0), color: "text-green-500" },
            { icon: Users, label: "Comisión", value: formatCurrency(stats?.feesToday ?? 0), color: "text-orange-500" },
            { icon: BarChart2, label: "Ganancia neta", value: formatCurrency(stats?.netToday ?? 0), color: "text-brand-500" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="card text-center py-4">
              <Icon size={22} className={`${color} mx-auto mb-1`} />
              <p className="text-lg font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/partner/products" className="card text-center py-4 hover:shadow-md transition-shadow">
            <p className="text-2xl mb-1">🍽️</p><p className="text-xs font-semibold text-gray-700">Productos</p>
          </Link>
          <Link href="/partner/orders" className="card text-center py-4 hover:shadow-md transition-shadow">
            <p className="text-2xl mb-1">📋</p><p className="text-xs font-semibold text-gray-700">Pedidos</p>
          </Link>
          <Link href="/partner/reports" className="card text-center py-4 hover:shadow-md transition-shadow">
            <p className="text-2xl mb-1">📊</p><p className="text-xs font-semibold text-gray-700">Reportes</p>
          </Link>
        </div>

        {/* Pending orders */}
        <div>
          <h2 className="font-bold text-gray-800 mb-3">Pedidos pendientes ({pendingOrders?.length ?? 0})</h2>
          {(pendingOrders ?? []).length === 0 ? (
            <div className="card text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-sm">Sin pedidos pendientes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(pendingOrders ?? []).map((order: { id: string; client?: { name?: string; phone?: string }; items: { productName: string; quantity: number }[]; total: number; status: string; type: string; notes?: string }) => (
                <div key={order.id} className="card border-l-4 border-brand-400">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{order.client?.name}</p>
                      <p className="text-xs text-gray-400">{order.type === "DELIVERY" ? "🚚 Entrega" : "🏪 Recogida"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-brand-500">{formatCurrency(order.total)}</p>
                      <span className={`badge ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(" • ")}
                  </div>
                  {order.notes && <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1 mb-3">📝 {order.notes}</p>}
                  {NEXT_ACTION[order.status] && (
                    <button onClick={() => NEXT_ACTION[order.status].fn(order.id)} className={NEXT_ACTION[order.status].color}>
                      {NEXT_ACTION[order.status].label}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
