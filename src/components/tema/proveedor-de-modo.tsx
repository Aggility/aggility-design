"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * El modo claro/oscuro (CA-3): la clase va en `<html>`, sin elección guardada se sigue al
 * sistema operativo y la elección se recuerda en el dispositivo. Sin transición al cambiar,
 * para que el cambio de modo no se vea como una animación.
 */
export function ProveedorDeModo({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
