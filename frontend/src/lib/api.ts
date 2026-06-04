import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

// Businesses
export const businessApi = {
  list: (params?: Record<string, string>) => api.get("/businesses", { params }),
  getById: (id: string) => api.get(`/businesses/${id}`),
  create: (data: unknown) => api.post("/businesses", data),
  update: (data: unknown) => api.patch("/businesses/me", data),
  getMyBusiness: () => api.get("/businesses/me/info"),
  getDashboard: () => api.get("/businesses/me/dashboard"),
  toggle: () => api.patch("/businesses/me/toggle"),
};

// Products
export const productApi = {
  list: () => api.get("/products"),
  create: (data: unknown) => api.post("/products", data),
  update: (id: string, data: unknown) => api.patch(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  createCategory: (data: { name: string; sortOrder?: number }) => api.post("/products/categories", data),
  getMarginReport: () => api.get("/products/reports/margin"),
};

// Orders
export const orderApi = {
  create: (data: unknown) => api.post("/orders", data),
  myOrders: () => api.get("/orders/my"),
  businessOrders: (status?: string) => api.get("/orders/business", { params: status ? { status } : {} }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, note?: string) =>
    api.patch(`/orders/${id}/status`, { status, note }),
  cancel: (id: string, reason?: string) => api.patch(`/orders/${id}/cancel`, { reason }),
};

// Plans
export const planApi = {
  list: () => api.get("/plans"),
  subscribe: (planId: string) => api.post(`/plans/${planId}/subscribe`),
};

// Admin
export const adminApi = {
  dashboard: () => api.get("/admin/dashboard"),
  businesses: (status?: string) => api.get("/admin/businesses", { params: status ? { status } : {} }),
  updateBusinessStatus: (id: string, status: string) =>
    api.patch(`/admin/businesses/${id}/status`, { status }),
  toggleHighlight: (id: string) => api.patch(`/admin/businesses/${id}/highlight`),
  users: (params?: Record<string, string>) => api.get("/admin/users", { params }),
  updateUserStatus: (id: string, status: string) => api.patch(`/admin/users/${id}/status`, { status }),
  drivers: () => api.get("/admin/drivers"),
  updateDriverStatus: (id: string, status: string) =>
    api.patch(`/admin/drivers/${id}/status`, { status }),
  financialReport: (params?: Record<string, string>) => api.get("/admin/reports/financial", { params }),
  createPlan: (data: unknown) => api.post("/plans", data),
  updatePlan: (id: string, data: unknown) => api.patch(`/plans/${id}`, data),
};
