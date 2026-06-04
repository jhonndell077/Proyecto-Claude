"use client";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { BarChart2, Building, CheckCircle, Clock, DollarSign, Package, Users, Truck } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard().then((r) => r.data.data),
  });

  const stats = [
    { label: "Usuarios totales", value: data?.users?.total ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Comercios activos", value: data?.businesses?.active ?? 0, icon: Building, color: "text-green-500", bg: "bg-green-50" },
    { label: "Pendientes aprobación", value: data?.businesses?.pending ?? 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Repartidores activos", value: data?.drivers?.active ?? 0, icon: Truck, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "Pedidos hoy", value: data?.orders?.today ?? 0, icon: Package, color: "text-brand-500", bg: "bg-brand-50" },
    { label: "Comisiones totales", value: formatCurrency(data?.revenue?.commissions ?? 0), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "GMV total", value: formatCurrency(data?.revenue?.gmv ?? 0), icon: BarChart2, color: "text-indigo-500", bg: "bg-indigo-50" },
    { label: "Membresías cobradas", value: formatCurrency(data?.revenue?.memberships ?? 0), icon: CheckCircle, color: "text-teal-500", bg: "bg-teal-50" },
  ];

  const links = [
    { href: "/admin/businesses", label: "Gestionar Comercios", emoji: "🏪", desc: "Aprobar, suspender, destacar" },
    { href: "/admin/users", label: "Gestionar Usuarios", emoji: "👥", desc: "Clientes, socios, repartidores" },
    { href: "/admin/plans", label: "Planes de Membresía", emoji: "💎", desc: "Crear y editar planes" },
    { href: "/admin/reports", label: "Reportes Financieros", emoji: "📊", desc: "Ventas, comisiones, GMV" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-8">
        <h1 className="text-2xl font-black">Panel Administrativo</h1>
        <p className="text-gray-400 text-sm mt-1">Visión general de la plataforma</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card py-4">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              {isLoading ? (
                <div className="h-6 bg-gray-100 rounded animate-pulse mb-1" />
              ) : (
                <p className="text-xl font-black text-gray-900">{value}</p>
              )}
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="grid md:grid-cols-2 gap-4">
          {links.map(({ href, label, emoji, desc }) => (
            <Link key={href} href={href} className="card flex items-center gap-4 hover:shadow-md transition-shadow">
              <span className="text-3xl">{emoji}</span>
              <div>
                <p className="font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
