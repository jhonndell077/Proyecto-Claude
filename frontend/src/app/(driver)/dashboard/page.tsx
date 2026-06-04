"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { Clock, MapPin, Package, Power, Star, Truck } from "lucide-react";
import toast from "react-hot-toast";

const driverApi = {
  dashboard: () => api.get("/driver/dashboard"),
  toggleAvailability: () => api.patch("/driver/availability"),
  availableOrders: () => api.get("/driver/orders/available"),
  acceptOrder: (id: string) => api.post(`/driver/orders/${id}/accept`),
  updateStatus: (id: string, status: string) => api.patch(`/driver/orders/${id}/status`, { status }),
};

export default function DriverDashboardPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["driver-dashboard"],
    queryFn: () => driverApi.dashboard().then((r) => r.data.data),
  });

  const { data: available } = useQuery({
    queryKey: ["available-orders"],
    queryFn: () => driverApi.availableOrders().then((r) => r.data.data),
    refetchInterval: 10000,
  });

  const toggle = useMutation({
    mutationFn: () => driverApi.toggleAvailability(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driver-dashboard"] }),
  });

  const accept = useMutation({
    mutationFn: (id: string) => driverApi.acceptOrder(id),
    onSuccess: () => { toast.success("Pedido aceptado"); qc.invalidateQueries({ queryKey: ["driver-dashboard", "available-orders"] }); },
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => driverApi.updateStatus(id, status),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["driver-dashboard"] }); },
  });

  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-10 w-10 rounded-full border-4 border-brand-500 border-t-transparent" /></div>;

  const { driver, stats, activeOrders } = data ?? {};

  const NEXT_STATUS: Record<string, string> = { ASSIGNED: "PICKED_UP", PICKED_UP: "ON_WAY", ON_WAY: "DELIVERED" };
  const NEXT_LABEL: Record<string, string> = { ASSIGNED: "Marcar recogido", PICKED_UP: "En camino", ON_WAY: "Entregado ✅" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-brand-500 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black flex items-center gap-2"><Truck size={22} />Mi panel</h1>
            <p className="text-brand-100 text-sm">{driver?.vehicleType}</p>
          </div>
          <button
            onClick={() => toggle.mutate()}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors ${driver?.isAvailable ? "bg-white/20 hover:bg-white/30" : "bg-white text-brand-600"}`}
          >
            <Power size={16} />
            {driver?.isAvailable ? "Disponible ✓" : "No disponible"}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Package, label: "Entregas hoy", value: stats?.deliveriesToday ?? 0 },
            { icon: Clock, label: "Ganancias hoy", value: formatCurrency(stats?.earningsToday ?? 0) },
            { icon: Star, label: "Calificación", value: driver?.rating?.toFixed(1) ?? "N/A" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card text-center py-4">
              <Icon size={20} className="text-brand-400 mx-auto mb-2" />
              <p className="font-black text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Active orders */}
        {(activeOrders ?? []).length > 0 && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">Entrega en curso</h2>
            {activeOrders.map((order: { id: string; status: string; business?: { name?: string; address?: string }; client?: { name?: string; phone?: string }; total: number; deliveryAddress?: string }) => (
              <div key={order.id} className="card border-l-4 border-brand-500">
                <div className="flex justify-between mb-3">
                  <p className="font-bold">Pedido #{order.id.slice(-6)}</p>
                  <span className="text-brand-500 font-bold">{formatCurrency(order.total)}</span>
                </div>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-brand-400" /><strong>Recoger en:</strong> {order.business?.name} — {order.business?.address}</p>
                  <p className="flex items-center gap-2"><MapPin size={14} className="text-green-500" /><strong>Entregar a:</strong> {order.client?.name} — {order.deliveryAddress}</p>
                </div>
                {NEXT_STATUS[order.status] && (
                  <button
                    onClick={() => updateStatus.mutate({ id: order.id, status: NEXT_STATUS[order.status] })}
                    className="btn-primary w-full"
                  >
                    {NEXT_LABEL[order.status]}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Available orders */}
        {driver?.isAvailable && (
          <div>
            <h2 className="font-bold text-gray-800 mb-3">Pedidos disponibles ({(available ?? []).length})</h2>
            {(available ?? []).length === 0 ? (
              <div className="card text-center py-10 text-gray-400 text-sm">
                <Truck size={32} className="mx-auto mb-2 text-gray-200" />
                No hay pedidos disponibles ahora
              </div>
            ) : (
              <div className="space-y-3">
                {(available ?? []).map((order: { id: string; business?: { name?: string; address?: string; city?: string }; items: { productName: string; quantity: number }[]; deliveryFee: number; deliveryAddress?: string }) => (
                  <div key={order.id} className="card">
                    <div className="flex justify-between mb-2">
                      <p className="font-semibold text-sm">{order.business?.name}</p>
                      <span className="text-green-600 font-bold text-sm">{formatCurrency(order.deliveryFee)} delivery</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">📍 {order.business?.address}, {order.business?.city}</p>
                    <p className="text-xs text-gray-500 mb-3">🏠 {order.deliveryAddress}</p>
                    <p className="text-xs text-gray-400 mb-3">{order.items.map((i) => `${i.quantity}x ${i.productName}`).join(" • ")}</p>
                    <button onClick={() => accept.mutate(order.id)} disabled={accept.isPending} className="btn-primary w-full text-sm py-2">
                      Aceptar entrega
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
