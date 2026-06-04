import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeliveryApp RD — Pedidos a domicilio",
  description: "La plataforma nacional de delivery y pedidos. Restaurantes, farmacias, colmados y más.",
  keywords: ["delivery", "pedidos", "domicilio", "restaurantes", "dominicana"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
