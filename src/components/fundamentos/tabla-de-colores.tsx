"use client";

import { useEffect, useState } from "react";

/** Un color de la fuente, con el valor que le toca en cada modo y para qué se usa. */
export type ColorDeLaTabla = {
  name: string;
  usage: string;
  claro: string;
  oscuro: string;
};

/**
 * El modo que el tema está aplicando ahora, leído de la clase del elemento raíz.
 *
 * Arranca en claro y se corrige al montar, a propósito: el modo elegido se sabe recién en el
 * navegador, así que leerlo durante el render haría que el servidor y el cliente dibujen cosas
 * distintas (desajuste de hidratación).
 */
function useModoActivo(): "claro" | "oscuro" {
  const [modo, setModo] = useState<"claro" | "oscuro">("claro");

  useEffect(() => {
    const raiz = document.documentElement;
    const leer = () => setModo(raiz.classList.contains("dark") ? "oscuro" : "claro");

    leer();

    const observador = new MutationObserver(leer);
    observador.observe(raiz, { attributes: true, attributeFilter: ["class"] });

    return () => observador.disconnect();
  }, []);

  return modo;
}

/**
 * La tabla de colores del tema: cada color con su nombre, su valor en el modo activo y su uso.
 *
 * Los valores llegan de la fuente de valores (`sistema/tokens.json`), así que un color nuevo o
 * cambiado se ve sin tocar esta pantalla.
 */
export function TablaDeColores({ colores }: { colores: ColorDeLaTabla[] }) {
  const modo = useModoActivo();

  return (
    <ul className="flex flex-col gap-3">
      {colores.map((color) => (
        <li
          key={color.name}
          data-color={color.name}
          className="flex items-start gap-4 border-b border-border pb-3"
        >
          <span
            aria-hidden="true"
            className="size-10 shrink-0 rounded-md border border-border"
            style={{ backgroundColor: `var(--${color.name})` }}
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-body-strong">{color.name}</span>
            <code data-valor className="text-small text-muted-foreground">
              {color[modo]}
            </code>
            <span className="text-small text-muted-foreground">{color.usage}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
