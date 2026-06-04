"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { orderApi } from "@/lib/api";
import { formatCurrency, formatDate, ORDER_STATUS_COLOR, ORDER_STATUS_LABELS } from "@/lib/utils";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OrdersPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => orderApi.myOrders().then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Mis pedidos</h1>
      </div>
      <div className="max-w-lg mx-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}</div>
        ) : (data ?? []).length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">Aún no tienes pedidos</p>
            <Link href="/home" className="btn-primary mt-4 inline-block px-6">Hacer mi primer pedido</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {(data ?? []).map((order: { id: string; business?: { name?: string }; status: string; total: number; items: { productName: string }[]; createdAt: string }) => (
              <Link key={order.id} href={`/orders/track?id=${order.id}`} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                  🍽️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">{order.business?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{order.items.map((i) => i.productName).join(", ")}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-brand-500 text-sm">{formatCurrency(order.total)}</p>
                  <span className={`badge text-xs ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABELS[order.status]}</span>
                </div>
                <ChevronRight size={16} className="text-gray-300" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
