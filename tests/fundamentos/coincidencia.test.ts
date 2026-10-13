import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { fileURLToPath } from "node:url";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Fundamentos from "@/app/fundamentos/page";

/**
 * En Vitest el import estático de una imagen queda como una URL suelta, así que `next/image` no
 * puede sacar el ancho y el alto del archivo y protesta. Se reemplaza por una imagen común: lo que
 * la pantalla dibuja de verdad —que la imagen cargue, con su tamaño y sin deformar— se verifica en
 * el navegador (`e2e/fundamentos.spec.ts`).
 */
vi.mock("next/image", async () => {
  const { createElement: crear } = await import("react");

  return {
    default: ({ src, ...resto }: { src: string | { src: string } }) =>
      crear("img", { src: typeof src === "string" ? src : src.src, ...resto }),
  };
});

/**
 * CA-2 sobre la pantalla de fundamentos: lo que la pantalla muestra sale de `sistema/tokens.json`.
 *
 * Es la versión sin navegador de la coincidencia con la fuente: renderiza la pantalla de verdad y
 * comprueba, valor por valor, que lo que muestra y la clase del tema que usa son los de la fuente.
 * Los nombres y los valores no están escritos acá: salen del archivo de la fuente, y lo único que
 * se deriva es la clase que le toca a cada nombre (`space-4` → `gap-4`, `radius-lg` → `rounded-lg`,
 * `chart-3` → `var(--chart-3)`), que es la convención que el tema publica.
 */

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

const FUENTE = JSON.parse(readFileSync(path.join(RAIZ, "sistema", "tokens.json"), "utf8"));

type Color = { name: string; value: string | { light: string; dark: string }; usage: string };
type Estilo = {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  sample: string;
  usage: string;
};
type Medida = { name: string; value: string; usage: string };

const COLORES: Color[] = FUENTE.color.tokens;
const ESTILOS: Estilo[] = FUENTE.type.groups.flatMap((grupo: { styles: Estilo[] }) => grupo.styles);
const ESPACIOS: Medida[] = FUENTE.spacing.tokens;
const RADIOS: Medida[] = FUENTE.radius.tokens;
const SERIES: Color[] = COLORES.filter((color) => /^chart-/.test(color.name));
const ESTADOS: Color[] = COLORES.filter((color) => /^(success|warning|destructive)$/.test(color.name));
const LOGOS = readdirSync(path.join(RAIZ, "sistema", "logos")).filter((archivo) =>
  /\.(png|webp|svg|jpe?g)$/i.test(archivo),
);

/** El valor que la fuente declara para el modo claro, que es el que jsdom muestra al renderizar. */
function enClaro(color: Color): string {
  return typeof color.value === "string" ? color.value : color.value.light;
}

/** Si un elemento lleva esa clase (y no una que la contenga). */
function lleva(elemento: Element | null, clase: string, que: string): string[] {
  if (elemento === null) {
    return [`${que}: no está en la pantalla`];
  }

  return new RegExp(`(^|\\s)${clase}(\\s|$)`).test(elemento.className) ? [] : [`${que}: no lleva la clase ${clase}`];
}

describe("lo que muestra la pantalla de fundamentos sale de la fuente (CA-2)", () => {
  afterEach(cleanup);

  /** La pantalla renderizada, para consultarla en cada caso. */
  function pantalla(): HTMLElement {
    return render(createElement(Fundamentos)).container;
  }

  it("cada color del tema se ve con su valor en el modo activo", () => {
    const contenedor = pantalla();

    expect(contenedor.querySelectorAll("[data-color]")).toHaveLength(COLORES.length);

    const fallas: string[] = [];

    for (const color of COLORES) {
      const fila = contenedor.querySelector(`[data-color="${color.name}"]`);
      const valor = fila?.querySelector("[data-valor]")?.textContent?.trim();

      if (valor !== enClaro(color)) {
        fallas.push(`${color.name}: muestra "${valor ?? "(nada)"}" y la fuente dice "${enClaro(color)}"`);
      }
    }

    expect(fallas, "cada color con el valor de la fuente").toEqual([]);
  });

  it("cada estilo de texto usa la clase del tema que le toca y muestra sus medidas", () => {
    const contenedor = pantalla();
    const fallas: string[] = [];

    for (const estilo of ESTILOS) {
      const fila = contenedor.querySelector(`[data-estilo="${estilo.name}"]`);

      fallas.push(...lleva(fila?.querySelector("[data-muestra]") ?? null, `text-${estilo.name}`, estilo.name));

      const medidas: Record<string, string> = {
        tamano: estilo.fontSize,
        linea: estilo.lineHeight,
        peso: String(estilo.fontWeight),
      };

      for (const [cual, esperada] of Object.entries(medidas)) {
        const vista = fila?.querySelector(`[data-medida="${cual}"]`)?.textContent?.trim();

        if (vista !== esperada) {
          fallas.push(`${estilo.name}: ${cual} muestra "${vista ?? "(nada)"}" y la fuente dice "${esperada}"`);
        }
      }
    }

    expect(fallas, "cada estilo con su clase y sus medidas").toEqual([]);
  });

  it("cada espacio y cada radio usan la clase del tema y muestran su medida", () => {
    const contenedor = pantalla();
    const fallas: string[] = [];

    for (const espacio of ESPACIOS) {
      const fila = contenedor.querySelector(`[data-espacio="${espacio.name}"]`);
      const clase = `gap-${espacio.name.split("-")[1]}`;

      fallas.push(...lleva(fila?.querySelector("[data-ejemplo]") ?? null, clase, espacio.name));

      const vista = fila?.querySelector("[data-medida]")?.textContent?.trim();

      if (vista !== espacio.value) {
        fallas.push(`${espacio.name}: muestra "${vista ?? "(nada)"}" y la fuente dice "${espacio.value}"`);
      }
    }

    for (const radio of RADIOS) {
      const fila = contenedor.querySelector(`[data-radio="${radio.name}"]`);
      const clase = `rounded-${radio.name.split("-")[1]}`;

      fallas.push(...lleva(fila?.querySelector("[data-ejemplo]") ?? null, clase, radio.name));

      const vista = fila?.querySelector("[data-medida]")?.textContent?.trim();

      if (vista !== radio.value) {
        fallas.push(`${radio.name}: muestra "${vista ?? "(nada)"}" y la fuente dice "${radio.value}"`);
      }
    }

    expect(fallas, "cada espacio y cada radio con su clase y su medida").toEqual([]);
  });

  it("cada serie y cada estado usan el color del tema que la fuente nombra", () => {
    const contenedor = pantalla();
    const fallas: string[] = [];

    for (const serie of SERIES) {
      const fila = contenedor.querySelector(`[data-serie="${serie.name}"]`);
      const muestra = fila?.querySelector("[data-muestra]") as HTMLElement | null;
      const fondo = muestra?.style.backgroundColor.replace(/\s+/g, "");

      if (fondo !== `var(--${serie.name})`) {
        fallas.push(`${serie.name}: se pinta con "${fondo ?? "(nada)"}" y la fuente lo llama --${serie.name}`);
      }
    }

    for (const estado of ESTADOS) {
      const fila = contenedor.querySelector(`[data-estado="${estado.name}"]`);

      fallas.push(...lleva(fila?.querySelector("[data-slot='badge']") ?? null, `text-${estado.name}`, estado.name));
    }

    expect(fallas, "las series y los estados, con el color del tema").toEqual([]);
    expect(contenedor.querySelectorAll("[data-serie]")).toHaveLength(SERIES.length);
    expect(contenedor.querySelectorAll("[data-estado]")).toHaveLength(ESTADOS.length);
  });

  it("cada logo de la carpeta del sistema está en la pantalla", () => {
    const contenedor = pantalla();
    const faltantes = LOGOS.filter((archivo) => contenedor.querySelector(`[data-logo="${archivo}"]`) === null);

    expect(faltantes, "los archivos de sistema/logos, todos en la pantalla").toEqual([]);
    expect(contenedor.querySelectorAll("[data-logo]")).toHaveLength(LOGOS.length);
  });
});
