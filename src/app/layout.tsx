import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";

import { BarraLateral } from "@/components/estructura/barra-lateral";
import { Encabezado } from "@/components/estructura/encabezado";
import { ProveedorDeModo } from "@/components/tema/proveedor-de-modo";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    // `suppressHydrationWarning`: next-themes actualiza la clase de este elemento, como pide
    // su documentación. Sólo aplica a este nivel, no tapa diferencias de los hijos.
    <html lang="es-AR" className={inter.variable} suppressHydrationWarning>
      <body>
        <ProveedorDeModo>
          {/* `TooltipProvider` agrupa los tooltips y aplica el retardo compartido. */}
          <TooltipProvider>
            <SidebarProvider>
              <BarraLateral />
              {/* `SidebarInset` es el `main` de la pantalla: las páginas no llevan otro. */}
              <SidebarInset>
                <Encabezado />
                {children}
              </SidebarInset>
            </SidebarProvider>
          </TooltipProvider>
        </ProveedorDeModo>
      </body>
    </html>
  );
}
