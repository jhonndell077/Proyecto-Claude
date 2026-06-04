import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  businessId: string | null;
  businessName: string | null;
  addItem: (product: Product, businessId: string, businessName: string, notes?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  subtotal: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      businessId: null,
      businessName: null,

      addItem: (product, businessId, businessName, notes) => {
        const { items, businessId: currentBusiness } = get();
        if (currentBusiness && currentBusiness !== businessId) {
          if (!confirm("Agregar de otro comercio vaciará tu carrito. ¿Continuar?")) return;
          set({ items: [], businessId: null, businessName: null });
        }
        const existing = get().items.find((i) => i.product.id === product.id);
        if (existing) {
          set({ items: get().items.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) });
        } else {
          set({ items: [...get().items, { product, quantity: 1, notes }], businessId, businessName });
        }
      },

      removeItem: (productId) =>
        set((state) => {
          const items = state.items.filter((i) => i.product.id !== productId);
          return { items, businessId: items.length ? state.businessId : null, businessName: items.length ? state.businessName : null };
        }),

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) { get().removeItem(productId); return; }
        set({ items: get().items.map((i) => i.product.id === productId ? { ...i, quantity } : i) });
      },

      clearCart: () => set({ items: [], businessId: null, businessName: null }),

      subtotal: () => get().items.reduce((acc, i) => acc + i.product.price * i.quantity, 0),
      total: () => get().subtotal(),
      itemCount: () => get().items.reduce((acc, i) => acc + i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
