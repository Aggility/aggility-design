import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { generarTema } from "../../scripts/generar-tema.mjs";

const DIRECTORIO = path.dirname(fileURLToPath(import.meta.url));
const FUENTE = path.join(DIRECTORIO, "..", "..", "sistema", "tokens.json");

interface Radio {
  name: string;
  value: string;
  usage: string;
}

interface Fuente {
  radius: { tokens: Radio[] };
}

const fuente = JSON.parse(readFileSync(FUENTE, "utf8")) as Fuente;

/** Los cuatro sufijos del tema, en el orden de la fuente. */
const SUFIJOS = ["sm", "md", "lg", "xl"];

/** Un valor de longitud del tema, en píxeles (la raíz mide 16 px). */
function enPx(valor: string): number {
  const medida = /^([\d.]+)(px|rem)$/.exec(valor.trim());

  if (!medida) {
    throw new Error(`No sé leer la medida "${valor}": tiene que ser en px o en rem.`);
  }

  const numero = Number.parseFloat(medida[1]);

  return medida[2] === "rem" ? numero * 16 : numero;
}

/** El radio base del tema, en píxeles, desde `--radius` de `:root`. */
function radioBaseEnPx(tema: string): number {
  const base = /--radius\s*:\s*([^;]+);/.exec(tema)?.[1];

  if (!base) {
    throw new Error("El tema no declara el radio base (--radius) en :root.");
  }

  return enPx(base);
}

/** Lo que el tema declara para uno de los cuatro radios. */
function declarado(tema: string, sufijo: string): string {
  const valor = new RegExp(`--radius-${sufijo}\\s*:\\s*([^;]+);`).exec(tema)?.[1];

  if (!valor) {
    throw new Error(`El tema no declara --radius-${sufijo}.`);
  }

  return valor.trim();
}

/** Un radio derivado se escribe sobre el radio base: `var(--radius)` o `calc(var(--radius) * k)`. */
function desdeLaBase(valor: string): RegExpMatchArray | null {
  return /^(?:var\(--radius\)|calc\(var\(--radius\) \* [\d.]+\))$/.exec(valor);
}

/** La proporción que un radio guarda con el radio base. */
function proporcion(valor: string): number {
  if (valor === "var(--radius)") {
    return 1;
  }

  return Number.parseFloat(/^calc\(var\(--radius\) \* ([\d.]+)\)$/.exec(valor)?.[1] ?? "NaN");
}

describe("los radios del tema", () => {
  const tema = generarTema(fuente);
  const radios = fuente.radius.tokens;

  it("publica los cuatro radios de la fuente, con su nombre y derivados del radio base", () => {
    const faltas: string[] = [];

    expect(radios.map((radio) => radio.name)).toEqual(SUFIJOS.map((sufijo) => `radius-${sufijo}`));

    for (const sufijo of SUFIJOS) {
      const valor = declarado(tema, sufijo);

      if (!desdeLaBase(valor)) {
        faltas.push(`--radius-${sufijo}: dice ${valor} y tiene que salir del radio base`);
      }
    }

    expect(faltas).toEqual([]);
  });

  it("los cuatro radios valen lo que la fuente dice: 6, 8, 10 y 14 px", () => {
    const faltas: string[] = [];

    for (const radio of radios) {
      const sufijo = radio.name.replace("radius-", "");
      const esperado = enPx(radio.value);
      const hay = radioBaseEnPx(tema) * proporcion(declarado(tema, sufijo));

      if (Math.abs(hay - esperado) > 0.0001) {
        faltas.push(`--radius-${sufijo}: hay ${hay}px, la fuente dice ${esperado}px`);
      }
    }

    expect(faltas).toEqual([]);
  });

  it("los cuatro radios siguen al radio base: si la base cambia, los cuatro cambian en la misma proporción", () => {
    const proporciones = SUFIJOS.map((sufijo) => proporcion(declarado(tema, sufijo)));
    const baseAmpliada: Fuente = structuredClone(fuente);

    baseAmpliada.radius.tokens = baseAmpliada.radius.tokens.map((radio) =>
      radio.name === "radius-lg" ? { ...radio, value: "16px" } : radio,
    );

    const temaAmpliado = generarTema(baseAmpliada);
    const faltas: string[] = [];

    expect(radioBaseEnPx(temaAmpliado)).toBe(16);

    SUFIJOS.forEach((sufijo, indice) => {
      const hay = radioBaseEnPx(temaAmpliado) * proporcion(declarado(temaAmpliado, sufijo));
      const esperado = 16 * proporciones[indice];

      if (Math.abs(hay - esperado) > 0.0001) {
        faltas.push(`--radius-${sufijo}: con la base en 16px hay ${hay}px y la proporción pide ${esperado}px`);
      }
    });

    expect(faltas).toEqual([]);
  });
});
