import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

/** La única tipografía del sistema, servida desde la app (`--font-sans` la usa). */
const inter = Inter({
  subsets: ["latin"],
  // Sólo los pesos que define la fuente de valores: 400, 500 y 600.
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aggility — sistema de diseño",
  description: "La referencia visual de las herramientas de Aggility.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
