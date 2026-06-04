export type Role = "CLIENT" | "PARTNER" | "DRIVER" | "ADMIN" | "SUPER_ADMIN";
export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING";
export type BusinessStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED" | "INACTIVE";
export type BusinessCategory =
  | "RESTAURANT" | "FAST_FOOD" | "CAFE" | "PHARMACY"
  | "GROCERY" | "BAKERY" | "FOOD_TRUCK" | "DESSERTS" | "BEVERAGES" | "OTHER";
export type OrderStatus =
  | "RECEIVED" | "ACCEPTED" | "PREPARING" | "READY"
  | "ASSIGNED" | "PICKED_UP" | "ON_WAY" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type OrderType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  maxProducts: number;
  commissionRate: number;
  isHighlighted: boolean;
  features: string[];
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  cover?: string;
  category: BusinessCategory;
  address: string;
  city: string;
  province: string;
  phone: string;
  status: BusinessStatus;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  commissionRate: number;
  rating: number;
  reviewCount: number;
  deliveryFee: number;
  minOrder: number;
  estimatedTime: number;
  isHighlighted: boolean;
  plan?: Plan;
  productCategories?: ProductCategory[];
}

export interface ProductCategory {
  id: string;
  name: string;
  sortOrder: number;
  products: Product[];
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  cost: number;
  isAvailable: boolean;
  isFeatured: boolean;
  categoryId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  clientId: string;
  businessId: string;
  status: OrderStatus;
  type: OrderType;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  notes?: string;
  estimatedTime?: number;
  items: OrderItem[];
  business?: Pick<Business, "id" | "name" | "logo">;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}
