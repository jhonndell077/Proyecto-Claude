"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/lib/api";
import { BusinessStatus } from "@/types";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

const STATUS_LABELS: Record<string, string> = { PENDING: "Pendiente", ACTIVE: "Activo", SUSPENDED: "Suspendido", REJECTED: "Rechazado" };
const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  ACTIVE: "bg-green-100 text-green-700",
  SUSPENDED: "bg-red-100 text-red-700",
  REJECTED: "bg-gray-100 text-gray-600",
};

export default function AdminBusinessesPage() {
  const [filter, setFilter] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-businesses", filter],
    queryFn: () => adminApi.businesses(filter || undefined).then((r) => r.data.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateBusinessStatus(id, status),
    onSuccess: () => { toast.success("Estado actualizado"); qc.invalidateQueries({ queryKey: ["admin-businesses"] }); },
  });

  const highlight = useMutation({
    mutationFn: (id: string) => adminApi.toggleHighlight(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-businesses"] }); },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-6">
        <h1 className="text-xl font-black">Gestión de Comercios</h1>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {["", "PENDING", "ACTIVE", "SUSPENDED", "REJECTED"].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filter === s ? "bg-gray-900 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {s ? STATUS_LABELS[s] : "Todos"}
            </button>
          ))}
        </div>

        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Comercio", "Propietario", "Ciudad", "Plan", "Estado", "Calificación", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td>
                      ))}
                    </tr>
                  ))
                  : (data ?? []).map((b: {
                    id: string; name: string; city: string; isHighlighted: boolean;
                    user?: { name?: string; email?: string }; plan?: { name?: string };
                    status: BusinessStatus; rating: number; reviewCount: number;
                  }) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.isHighlighted && <Star size={12} className="text-yellow-500 fill-yellow-400 flex-shrink-0" />}
                          <span className="font-medium text-gray-900">{b.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{b.user?.name}<br /><span className="text-xs text-gray-400">{b.user?.email}</span></td>
                      <td className="px-4 py-3 text-gray-500">{b.city}</td>
                      <td className="px-4 py-3 text-gray-500">{b.plan?.name ?? "—"}</td>
                      <td className="px-4 py-3"><span className={`badge ${STATUS_COLOR[b.status]}`}>{STATUS_LABELS[b.status]}</span></td>
                      <td className="px-4 py-3 text-gray-500">{b.rating.toFixed(1)} ⭐ ({b.reviewCount})</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-wrap">
                          {b.status === "PENDING" && (
                            <>
                              <button onClick={() => updateStatus.mutate({ id: b.id, status: "ACTIVE" })} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-lg font-semibold hover:bg-green-200">Aprobar</button>
                              <button onClick={() => updateStatus.mutate({ id: b.id, status: "REJECTED" })} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-lg font-semibold hover:bg-red-200">Rechazar</button>
                            </>
                          )}
                          {b.status === "ACTIVE" && (
                            <button onClick={() => updateStatus.mutate({ id: b.id, status: "SUSPENDED" })} className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-lg font-semibold hover:bg-orange-200">Suspender</button>
                          )}
                          {b.status === "SUSPENDED" && (
                            <button onClick={() => updateStatus.mutate({ id: b.id, status: "ACTIVE" })} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-lg font-semibold hover:bg-blue-200">Reactivar</button>
                          )}
                          <button onClick={() => highlight.mutate(b.id)} className={`text-xs px-2 py-1 rounded-lg font-semibold ${b.isHighlighted ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {b.isHighlighted ? "★ Quitar" : "☆ Destacar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
