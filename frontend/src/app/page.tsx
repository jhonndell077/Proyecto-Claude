import Link from "next/link";
import { Bike, ShieldCheck, Star, Store, Users, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-2xl font-black text-brand-500">Delivery<span className="text-gray-900">RD</span></span>
          <div className="flex gap-3">
            <Link href="/login" className="btn-secondary text-sm py-1.5">Iniciar sesión</Link>
            <Link href="/register" className="btn-primary text-sm py-1.5">Registrarse</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-500 to-brand-700 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
            Todo lo que necesitas,<br />directo a tu puerta
          </h1>
          <p className="text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
            Restaurantes, farmacias, colmados y más. La plataforma nacional de delivery que apoya
            comercios locales dominicanos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/home" className="bg-white text-brand-600 font-bold px-8 py-4 rounded-2xl text-lg hover:bg-brand-50 transition-colors">
              Pedir ahora
            </Link>
            <Link href="/register?role=PARTNER" className="border-2 border-white/60 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors">
              Unir mi negocio
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-12">¿Por qué DeliveryRD?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Pedidos en minutos", desc: "Seguimiento en tiempo real de tu pedido desde la cocina hasta tu puerta." },
              { icon: Store, title: "Comercios locales", desc: "Apoyamos negocios dominicanos. Calidad local, servicio profesional." },
              { icon: ShieldCheck, title: "100% seguro", desc: "Pagos protegidos y datos cifrados. Tu seguridad es nuestra prioridad." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center p-8">
                <Icon className="text-brand-500 mx-auto mb-4" size={40} />
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans preview */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-black text-center mb-3">Planes para socios</h2>
          <p className="text-center text-gray-500 mb-12">Crece tu negocio con la plataforma adecuada</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Básico", price: "Gratis", commission: "18%", highlight: false, features: ["20 productos", "Reportes básicos", "Soporte estándar"] },
              { name: "Pro", price: "RD$1,500/mes", commission: "15%", highlight: true, features: ["100 productos", "Mejor posición", "Reportes avanzados", "Análisis de margen"] },
              { name: "Premium", price: "RD$3,500/mes", commission: "10%", highlight: false, features: ["Productos ilimitados", "Posición destacada", "Publicidad en app", "Soporte prioritario"] },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl border-2 p-6 ${plan.highlight ? "border-brand-500 shadow-lg shadow-brand-100" : "border-gray-100"}`}>
                {plan.highlight && <div className="badge bg-brand-100 text-brand-700 mb-3">Más popular</div>}
                <h3 className="text-xl font-black mb-1">{plan.name}</h3>
                <div className="text-2xl font-bold text-brand-500 mb-1">{plan.price}</div>
                <div className="text-sm text-gray-400 mb-4">Comisión: {plan.commission}</div>
                <ul className="space-y-2 text-sm text-gray-600">
                  {plan.features.map((f) => <li key={f} className="flex items-center gap-2"><Star size={14} className="text-brand-400 flex-shrink-0" />{f}</li>)}
                </ul>
                <Link href="/register?role=PARTNER" className={`mt-6 block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${plan.highlight ? "btn-primary" : "btn-secondary"}`}>
                  Empezar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-500 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "500+", label: "Comercios" },
            { value: "50K+", label: "Clientes" },
            { value: "200+", label: "Repartidores" },
            { value: "4.8", label: "Calificación" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-4xl font-black">{value}</div>
              <div className="text-brand-200 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Repartidores */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <Bike className="mx-auto mb-4 text-brand-500" size={48} />
          <h2 className="text-3xl font-black mb-4">¿Quieres ser repartidor?</h2>
          <p className="text-gray-500 mb-8">Genera ingresos con tu propio tiempo. Regístrate como repartidor y empieza hoy.</p>
          <Link href="/register?role=DRIVER" className="btn-primary px-8 py-4 text-lg">
            Unirme como repartidor
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4 text-center text-sm">
        <div className="mb-2">
          <span className="text-white font-bold text-lg">DeliveryRD</span>
        </div>
        <p>© {new Date().getFullYear()} DeliveryRD. Todos los derechos reservados.</p>
        <div className="flex justify-center gap-6 mt-4">
          <Link href="/terms" className="hover:text-white transition-colors">Términos</Link>
          <Link href="/privacy" className="hover:text-white transition-colors">Privacidad</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contacto</Link>
        </div>
      </footer>
    </div>
  );
}
