import Link from "next/link";
import { Clock, Star, Truck } from "lucide-react";
import { Business } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props { business: Business }

const categoryEmoji: Record<string, string> = {
  RESTAURANT: "🍽️", FAST_FOOD: "🍔", CAFE: "☕", PHARMACY: "💊",
  GROCERY: "🛒", BAKERY: "🥖", FOOD_TRUCK: "🚚", DESSERTS: "🍰",
  BEVERAGES: "🥤", OTHER: "🏪",
};

export default function BusinessCard({ business }: Props) {
  return (
    <Link href={`/business?id=${business.id}`} className="card hover:shadow-md transition-shadow cursor-pointer block overflow-hidden p-0">
      {/* Cover */}
      <div className="h-36 bg-gradient-to-br from-brand-100 to-brand-200 relative flex items-center justify-center overflow-hidden">
        {business.cover ? (
          <img src={business.cover} alt={business.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{categoryEmoji[business.category] ?? "🏪"}</span>
        )}
        {!business.isOpen && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">Cerrado</span>
          </div>
        )}
        {business.isHighlighted && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
            ⭐ Destacado
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-gray-900 text-base leading-tight">{business.name}</h3>
          {business.logo && (
            <img src={business.logo} alt="" className="w-10 h-10 rounded-xl object-cover -mt-6 border-2 border-white shadow-sm" />
          )}
        </div>
        <p className="text-xs text-gray-500 mb-3 line-clamp-1">{business.description ?? business.city}</p>
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            {business.rating.toFixed(1)} ({business.reviewCount})
          </span>
          <span className="flex items-center gap-1">
            <Clock size={12} className="text-brand-400" />
            {business.estimatedTime} min
          </span>
          <span className="flex items-center gap-1">
            <Truck size={12} className="text-brand-400" />
            {business.deliveryFee > 0 ? formatCurrency(business.deliveryFee) : "Gratis"}
          </span>
        </div>
      </div>
    </Link>
  );
}
