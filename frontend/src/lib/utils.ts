import { clsx, type ClassValue } from "clsx";

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const formatCurrency = (amount: number) =>
  `RD$${amount.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export const formatDate = (date: string | Date) =>
  new Date(date).toLocaleString("es-DO", { dateStyle: "medium", timeStyle: "short" });

export const ORDER_STATUS_LABELS: Record<string, string> = {
  RECEIVED: "Pedido recibido",
  ACCEPTED: "Aceptado",
  PREPARING: "En preparación",
  READY: "Listo para recoger",
  ASSIGNED: "Repartidor asignado",
  PICKED_UP: "Recogido",
  ON_WAY: "En camino",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  RECEIVED: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-indigo-100 text-indigo-700",
  PREPARING: "bg-yellow-100 text-yellow-700",
  READY: "bg-orange-100 text-orange-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  PICKED_UP: "bg-violet-100 text-violet-700",
  ON_WAY: "bg-brand-100 text-brand-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};
