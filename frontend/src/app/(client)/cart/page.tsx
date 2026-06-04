"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart.store";
import { useAuthStore } from "@/store/auth.store";
import { orderApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CartPage() {
  const router = useRouter();
  const { items, businessId, businessName, subtotal, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [type, setType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD" | "TRANSFER">("CASH");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const sub = subtotal();

  const handleOrder = async () => {
    if (!isAuthenticated) { router.push("/login"); return; }
    if (type === "DELIVERY" && !address.trim()) { toast.error("Ingresa tu dirección de entrega"); return; }
    setLoading(true);
    try {
      const { data } = await orderApi.create({
        businessId,
        type,
        deliveryAddress: type === "DELIVERY" ? address : undefined,
        paymentMethod,
        notes,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity, notes: i.notes })),
      });
      clearCart();
      toast.success("¡Pedido realizado!");
      router.push(`/orders/${data.data.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al realizar el pedido";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-400 text-sm mb-6">Agrega productos de un comercio para continuar</p>
        <button onClick={() => router.push("/home")} className="btn-primary px-6">Ver comercios</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-1"><ArrowLeft size={22} /></button>
        <h1 className="font-bold text-lg">Tu pedido</h1>
        <span className="text-sm text-gray-500 ml-auto">{businessName}</span>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Items */}
        <div className="card">
          {items.map((item) => (
            <div key={item.product.id} className="flex items-center gap-3 py-3 border-b last:border-0">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.product.name}</p>
                <p className="text-brand-500 font-bold text-sm">{formatCurrency(item.product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 border rounded-lg hover:bg-gray-50">
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 border rounded-lg hover:bg-gray-50">
                  <Plus size={14} />
                </button>
                <button onClick={() => removeItem(item.product.id)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
              <span className="text-sm font-semibold w-16 text-right">{formatCurrency(item.product.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        {/* Delivery type */}
        <div className="card">
          <h3 className="font-semibold text-sm mb-3">Tipo de entrega</h3>
          <div className="grid grid-cols-2 gap-2">
            {(["DELIVERY", "PICKUP"] as const).map((t) => (
              <button key={t} onClick={() => setType(t)} className={`py-2 rounded-xl text-sm font-semibold border-2 transition-colors ${type === t ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}>
                {t === "DELIVERY" ? "🚚 A domicilio" : "🏪 Recogida"}
              </button>
            ))}
          </div>
          {type === "DELIVERY" && (
            <input
              className="input mt-3 text-sm"
              placeholder="Dirección de entrega"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
        </div>

        {/* Payment */}
        <div className="card">
          <h3 className="font-semibold text-sm mb-3">Método de pago</h3>
          <div className="grid grid-cols-3 gap-2">
            {[{ v: "CASH", l: "💵 Efectivo" }, { v: "CARD", l: "💳 Tarjeta" }, { v: "TRANSFER", l: "📲 Transferencia" }].map(({ v, l }) => (
              <button key={v} onClick={() => setPaymentMethod(v as typeof paymentMethod)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${paymentMethod === v ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="card">
          <h3 className="font-semibold text-sm mb-2">Notas (opcional)</h3>
          <textarea className="input text-sm h-20 resize-none" placeholder="Instrucciones especiales..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        {/* Summary */}
        <div className="card">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(sub)}</span></div>
            <div className="flex justify-between font-bold text-base pt-2 border-t"><span>Total</span><span className="text-brand-500">{formatCurrency(sub)}</span></div>
          </div>
        </div>

        <button onClick={handleOrder} disabled={loading} className="btn-primary w-full py-4 text-base">
          {loading ? "Procesando..." : `Confirmar pedido • ${formatCurrency(sub)}`}
        </button>
      </div>
    </div>
  );
}
