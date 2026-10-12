"use client";

import { Monitor, Moon, Sun, SunMoon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** Los tres modos que se pueden elegir, en el orden en que se muestran. */
const MODOS = [
  { valor: "light", etiqueta: "Claro", Icono: Sun },
  { valor: "dark", etiqueta: "Oscuro", Icono: Moon },
  { valor: "system", etiqueta: "Sistema", Icono: Monitor },
];

/**
 * El selector de modo del encabezado: claro, oscuro y sistema (CA-3).
 *
 * El botón dibuja un ícono neutro, no el del modo actual, y eso es a propósito: el modo
 * elegido se sabe recién en el navegador, así que un ícono que dependiera de él se dibujaría
 * distinto en el servidor y en el cliente. El modo actual se ve adentro del menú, con la
 * opción marcada.
 */
export function SelectorDeModo() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label="Modo de color" render={<Button variant="ghost" size="icon-sm" />}>
        <SunMoon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
          {MODOS.map(({ valor, etiqueta, Icono }) => (
            <DropdownMenuRadioItem key={valor} value={valor}>
              <Icono aria-hidden="true" />
              {etiqueta}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
