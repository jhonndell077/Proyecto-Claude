"use client";
import { useQuery } from "@tanstack/react-query";
import { productApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface MarginItem {
  id: string;
  name: string;
  price: number;
  cost: number;
  commission: number;
  netProfit: number;
  margin: number;
}

export default function ReportsPage() {
  const router = useRouter();
  const { data: margins, isLoading } = useQuery<MarginItem[]>({
    queryKey: ["margin-report"],
    queryFn: () => productApi.getMarginReport().then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()}><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Reporte de márgenes</h1>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        <div className="card bg-brand-50 border border-brand-100">
          <p className="text-sm text-brand-700 font-medium">💡 Este reporte muestra la rentabilidad real de cada producto, descontando el costo y la comisión de la plataforma.</p>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Producto", "Precio", "Costo", "Comisión", "Ganancia", "Margen"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading
                  ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="h-4 bg-gray-100 animate-pulse rounded" /></td></tr>)
                  : (margins ?? []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-gray-600">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatCurrency(item.cost)}</td>
                      <td className="px-4 py-3 text-orange-500">{formatCurrency(item.commission)}</td>
                      <td className="px-4 py-3 font-semibold text-green-600">{formatCurrency(item.netProfit)}</td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 font-bold ${item.margin > 30 ? "text-green-600" : item.margin > 15 ? "text-yellow-600" : "text-red-500"}`}>
                          {item.margin > 30 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {item.margin}%
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {(margins ?? []).length === 0 && !isLoading && (
            <div className="text-center py-10 text-gray-400 text-sm">
              Agrega costo a tus productos para ver el análisis de margen
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="card text-xs text-gray-500 space-y-1">
          <p><strong>Fórmula:</strong> Ganancia neta = Precio de venta − Costo − Comisión plataforma</p>
          <p><strong>Margen verde</strong> ({">"} 30%): Excelente rentabilidad</p>
          <p><strong>Margen amarillo</strong> (15-30%): Rentabilidad aceptable</p>
          <p><strong>Margen rojo</strong> ({"<"} 15%): Revisar precio o costo</p>
        </div>
      </div>
    </div>
  );
}
