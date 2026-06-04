"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setAuth(data.data.user, data.data.token);
      toast.success("¡Bienvenido!");
      const role = data.data.user.role;
      if (role === "ADMIN" || role === "SUPER_ADMIN") router.push("/admin/dashboard");
      else if (role === "PARTNER") router.push("/partner/dashboard");
      else if (role === "DRIVER") router.push("/driver/dashboard");
      else router.push("/home");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al iniciar sesión";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-500">Delivery<span className="text-gray-900">RD</span></Link>
          <h1 className="text-xl font-bold mt-4 text-gray-800">Iniciar sesión</h1>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Correo electrónico</label>
              <input
                type="email"
                className="input"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{" "}
            <Link href="/register" className="text-brand-500 font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
