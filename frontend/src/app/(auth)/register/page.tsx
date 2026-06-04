"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: (params.get("role") ?? "CLIENT") as string,
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.register(form);
      setAuth(data.data.user, data.data.token);
      toast.success("¡Cuenta creada!");
      if (form.role === "PARTNER") router.push("/partner/dashboard");
      else if (form.role === "DRIVER") router.push("/driver/dashboard");
      else router.push("/home");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Error al registrarse";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleLabels: Record<string, string> = { CLIENT: "Cliente", PARTNER: "Socio / Comercio", DRIVER: "Repartidor" };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-black text-brand-500">Delivery<span className="text-gray-900">RD</span></Link>
          <h1 className="text-xl font-bold mt-4 text-gray-800">Crear cuenta</h1>
        </div>
        <div className="card p-8">
          {/* Role selector */}
          <div className="mb-5">
            <label className="text-sm font-medium text-gray-700 block mb-2">¿Cómo quieres unirte?</label>
            <div className="grid grid-cols-3 gap-2">
              {["CLIENT", "PARTNER", "DRIVER"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set("role", r)}
                  className={`py-2 rounded-xl text-xs font-semibold border-2 transition-colors ${form.role === r ? "border-brand-500 bg-brand-50 text-brand-700" : "border-gray-200 text-gray-600"}`}
                >
                  {roleLabels[r]}
                </button>
              ))}
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Nombre completo</label>
              <input className="input" placeholder="Juan Pérez" value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Correo electrónico</label>
              <input type="email" className="input" placeholder="tu@email.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Teléfono</label>
              <input className="input" placeholder="809-000-0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Contraseña</label>
              <input type="password" className="input" placeholder="Mínimo 6 caracteres" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn-primary w-full py-3 mt-2" disabled={loading}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-brand-500 font-semibold hover:underline">Iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
