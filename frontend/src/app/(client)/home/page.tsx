"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { businessApi } from "@/lib/api";
import BusinessCard from "@/components/BusinessCard";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cart.store";

const CATEGORIES = [
  { value: "", label: "Todos" },
  { value: "RESTAURANT", label: "Restaurantes" },
  { value: "FAST_FOOD", label: "Comida rápida" },
  { value: "CAFE", label: "Café" },
  { value: "PHARMACY", label: "Farmacia" },
  { value: "GROCERY", label: "Colmado" },
  { value: "BAKERY", label: "Panadería" },
  { value: "FOOD_TRUCK", label: "Food Truck" },
];

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const cartCount = useCartStore((s) => s.itemCount());

  const { data, isLoading } = useQuery({
    queryKey: ["businesses", search, category],
    queryFn: () => businessApi.list({ search, category }).then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-8 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <span className="text-2xl font-black">Delivery<span className="text-brand-100">RD</span></span>
            <Link href="/cart" className="relative bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-xl">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-4">¿Qué te provoca hoy?</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-300"
              placeholder="Buscar restaurantes o comidas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-8">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                category === cat.value ? "bg-brand-500 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{data?.meta?.total ?? data?.data?.length ?? 0} comercios disponibles</p>
            <div className="grid md:grid-cols-2 gap-4">
              {(data?.data ?? []).map((business: Parameters<typeof BusinessCard>[0]["business"]) => (
                <BusinessCard key={business.id} business={business} />
              ))}
            </div>
            {(data?.data ?? []).length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">🍽️</p>
                <p className="font-medium">No se encontraron comercios</p>
                <p className="text-sm mt-1">Prueba con otra categoría o búsqueda</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
