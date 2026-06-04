"use client";
import { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { businessApi } from "@/lib/api";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { Product, ProductCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Clock, Plus, ShoppingCart, Star, Truck } from "lucide-react";
import toast from "react-hot-toast";

function BusinessPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { addItem, itemCount } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ["business", id],
    queryFn: () => businessApi.getById(id).then((r) => r.data.data),
    enabled: !!id,
  });

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) { router.push("/login"); return; }
    addItem(product, data.id, data.name);
    toast.success(`${product.name} agregado al carrito`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      </div>
    );
  }

  const cartTotal = useCartStore.getState().subtotal();
  const cartItems = itemCount();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="h-52 bg-gradient-to-br from-brand-200 to-brand-400 relative">
        {data?.cover && <img src={data.cover} alt={data.name} className="w-full h-full object-cover" />}
        <button onClick={() => router.back()} className="absolute top-4 left-4 bg-white/90 p-2 rounded-xl shadow">
          <ArrowLeft size={20} />
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="card -mt-6 mb-4">
          <div className="flex items-start gap-3">
            {data?.logo && <img src={data.logo} alt="" className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow" />}
            <div className="flex-1">
              <h1 className="text-xl font-black text-gray-900">{data?.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5">{data?.description}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Star size={12} className="text-yellow-400 fill-yellow-400" />{data?.rating?.toFixed(1)} ({data?.reviewCount} reseñas)</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-brand-400" />{data?.estimatedTime} min</span>
                <span className="flex items-center gap-1"><Truck size={12} className="text-brand-400" />{data?.deliveryFee > 0 ? formatCurrency(data.deliveryFee) : "Delivery gratis"}</span>
              </div>
              {!data?.isOpen && <div className="mt-2 text-xs font-semibold text-red-500 bg-red-50 px-2 py-1 rounded-lg inline-block">Cerrado ahora</div>}
            </div>
          </div>
        </div>

        {(data?.productCategories ?? []).map((cat: ProductCategory) => (
          <div key={cat.id} className="mb-6">
            <h2 className="text-base font-bold text-gray-800 mb-3 px-1">{cat.name}</h2>
            <div className="space-y-3">
              {cat.products.map((product) => (
                <div key={product.id} className="card flex items-center gap-4 py-3">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                  ) : (
                    <div className="w-20 h-20 bg-brand-50 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl">🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{product.name}</p>
                    {product.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{product.description}</p>}
                    <p className="text-brand-600 font-bold text-base mt-1">{formatCurrency(product.price)}</p>
                  </div>
                  <button onClick={() => handleAddToCart(product)} disabled={!data?.isOpen} className="btn-primary p-2 rounded-xl disabled:opacity-40">
                    <Plus size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {cartItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
          <button onClick={() => router.push("/cart")} className="w-full max-w-sm mx-auto flex items-center justify-between bg-brand-500 text-white px-5 py-4 rounded-2xl shadow-xl font-bold">
            <span className="bg-brand-400/60 text-white text-sm px-2 py-0.5 rounded-lg">{cartItems}</span>
            <span className="flex items-center gap-2"><ShoppingCart size={20} />Ver carrito</span>
            <span>{formatCurrency(cartTotal)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function BusinessPage() {
  return <Suspense><BusinessPageContent /></Suspense>;
}
