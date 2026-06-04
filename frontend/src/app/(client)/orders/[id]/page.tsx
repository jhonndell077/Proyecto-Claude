"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate, ORDER_STATUS_LABELS, ORDER_STATUS_COLOR } from "@/lib/utils";
import { ArrowLeft, CheckCircle, Clock, Package, Phone, Truck } from "lucide-react";
import { io } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

const STATUS_STEPS = ["RECEIVED", "ACCEPTED", "PREPARING", "READY", "ASSIGNED", "PICKED_UP", "ON_WAY", "DELIVERED"];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();
  const qc = useQueryClient();

  const { data: order } = useQuery({
    queryKey: ["order", id],
    queryFn: () => orderApi.getById(id).then((r) => r.data.data),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!token) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000", { auth: { token } });
    socket.emit("join_order", id);
    socket.on("order_status", () => qc.invalidateQueries({ queryKey: ["order", id] }));
    return () => { socket.disconnect(); };
  }, [id, token, qc]);

  if (!order) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-500 border-t-transparent" /></div>;
  }

  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.push("/orders")} className="p-1"><ArrowLeft size={22} /></button>
        <div>
          <h1 className="font-bold">Seguimiento de pedido</h1>
          <p className="text-xs text-gray-400">#{id.slice(-8).toUpperCase()}</p>
        </div>
        <span className={`badge ml-auto ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Status tracker */}
        {!isCancelled && (
          <div className="card">
            <h3 className="font-semibold text-sm mb-4">Estado del pedido</h3>
            <div className="space-y-3">
              {STATUS_STEPS.slice(0, order.type === "PICKUP" ? 4 : undefined).map((step, idx) => {
                const done = idx <= stepIndex;
                const current = idx === stepIndex;
                return (
                  <div key={step} className={`flex items-center gap-3 text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${done ? (current ? "bg-brand-500" : "bg-green-500") : "bg-gray-200"}`}>
                      {done && !current ? <CheckCircle size={16} className="text-white" /> : <span className="text-white text-xs font-bold">{idx + 1}</span>}
                    </div>
                    <span className={current ? "font-bold text-brand-600" : ""}>{ORDER_STATUS_LABELS[step]}</span>
                    {current && <Clock size={14} className="text-brand-400 ml-auto animate-pulse" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Business info */}
        <div className="card">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-brand-400" />
            <div>
              <p className="font-semibold text-sm">{order.business?.name}</p>
              <p className="text-xs text-gray-400">Tiempo estimado: {order.estimatedTime} min</p>
            </div>
            {order.business?.phone && (
              <a href={`tel:${order.business.phone}`} className="ml-auto p-2 bg-brand-50 rounded-xl text-brand-500">
                <Phone size={18} />
              </a>
            )}
          </div>
        </div>

        {/* Driver */}
        {order.driver && (
          <div className="card bg-brand-50 border border-brand-100">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-brand-500" />
              <div>
                <p className="font-semibold text-sm">Repartidor asignado</p>
                <p className="text-xs text-gray-600">{order.driver.user?.name}</p>
              </div>
              {order.driver.user?.phone && (
                <a href={`tel:${order.driver.user.phone}`} className="ml-auto p-2 bg-white rounded-xl text-brand-500 border border-brand-200">
                  <Phone size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="card">
          <h3 className="font-semibold text-sm mb-3">Resumen del pedido</h3>
          <div className="space-y-2">
            {order.items.map((item: { id: string; productName: string; quantity: number; price: number }) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}x {item.productName}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              {order.deliveryFee > 0 && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span><span>{formatCurrency(order.deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span><span className="text-brand-500">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400">Pedido realizado el {formatDate(order.createdAt)}</p>
      </div>
    </div>
  );
}
