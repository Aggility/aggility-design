import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * El anillo de foco del sistema (CA-8), tal como lo pide la guía visual: sólido, de 2px en
 * `ring` y separado 2px del elemento. Lo pone una regla global del CSS de la app
 * (`src/app/globals.css`, decisión 17 de `design.md`), no los componentes base.
 *
 * jsdom no carga la hoja de la app, así que la regla se le inyecta leyéndola del archivo: es la
 * misma que Tailwind compila en la app. Lo que acá no se puede medir —el color resuelto y el
 * orden de capas, que decide quién gana— se mide en el navegador, en `e2e/teclado-armazon.spec.ts`.
 */

const DIRECTORIO = path.dirname(fileURLToPath(import.meta.url));
const GLOBALS = path.join(DIRECTORIO, "..", "..", "src", "app", "globals.css");

/** El CSS de la app, sin comentarios: lo que el navegador termina leyendo. */
const css = readFileSync(GLOBALS, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** El anillo y la separación que pide la guía visual. */
const ANILLO = "outline: 2px solid var(--ring)";
const SEPARACION = "outline-offset: 2px";

/** Las declaraciones de la regla global de foco, o un error que dice qué falta. */
function reglaDeFoco(hoja: string): string {
  const regla = /:focus-visible\s*\{([^}]*)\}/.exec(hoja);

  if (regla === null) {
    throw new Error("`src/app/globals.css` no tiene ninguna regla `:focus-visible`");
  }

  return regla[1];
}

/** Si lo que está en la posición `indice` vive dentro de un `@layer`. */
function estaEnUnaCapa(hoja: string, indice: number): boolean {
  const pila: boolean[] = [];

  for (let posicion = 0; posicion < indice; posicion += 1) {
    const caracter = hoja[posicion];

    if (caracter === "{") {
      pila.push(/@layer[^{}]*$/.test(hoja.slice(0, posicion).trimEnd()));
    } else if (caracter === "}") {
      pila.pop();
    }
  }

  return pila.includes(true);
}

describe("el anillo de foco del sistema (CA-8)", () => {
  // Sin globals en Vitest, Testing Library no limpia sola: se limpia acá para que cada caso
  // arranque con una sola pantalla montada.
  afterEach(cleanup);

  beforeAll(() => {
    const estilo = document.createElement("style");

    estilo.textContent = `:focus-visible { ${reglaDeFoco(css)} }`;
    document.head.append(estilo);
  });

  it("la regla dice un anillo sólido de 2px en el color de `ring`, separado 2px", () => {
    const declaraciones = reglaDeFoco(css);

    expect(declaraciones, "el anillo").toContain(ANILLO);
    expect(declaraciones, "la separación").toContain(SEPARACION);
  });

  it("la regla vive fuera de los `@layer`, para ganarle a las utilidades del preset", () => {
    // Los componentes base traen su propio `outline-none` y su halo en las capas de Tailwind.
    // Sin capa, la regla de la app gana sin que haya que editar ningún componente.
    const indice = css.indexOf(":focus-visible");

    expect(indice, "globals.css tiene la regla de foco").toBeGreaterThan(-1);
    expect(estaEnUnaCapa(css, indice), "la regla no puede estar dentro de un `@layer`").toBe(false);
  });

  it("un botón y un campo con foco de teclado muestran ese anillo", async () => {
    const usuario = userEvent.setup();

    render(
      <>
        <Button>Guardar cliente</Button>
        <Input aria-label="Nombre del cliente" />
      </>,
    );

    // Los dos controles de la pantalla, en el orden en que los recorre Tab.
    const controles = [
      { nombre: "un botón", etiqueta: "button" },
      { nombre: "un campo", etiqueta: "input" },
    ];

    for (const { nombre, etiqueta } of controles) {
      await usuario.tab();

      const activo = document.activeElement as HTMLElement;
      const estilo = getComputedStyle(activo);

      expect(activo.tagName.toLowerCase(), `el foco del recorrido llega a ${nombre}`).toBe(etiqueta);
      expect(estilo.outline, `${nombre} tiene que mostrar el anillo del sistema`).toBe(
        "2px solid var(--ring)",
      );
      expect(estilo.outlineOffset, `y el anillo de ${nombre} tiene que quedar separado 2px`).toBe("2px");
    }
  });
});
