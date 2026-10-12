import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { generarTema } from "../../scripts/generar-tema.mjs";

const DIRECTORIO = path.dirname(fileURLToPath(import.meta.url));
const FUENTE = path.join(DIRECTORIO, "..", "..", "sistema", "tokens.json");

/** Un valor de la fuente: fijo, o uno por modo. */
type Valor = string | { light: string; dark: string };

interface TokenDeColor {
  name: string;
  value: Valor;
  usage: string;
}

interface Fuente {
  color: { tokens: TokenDeColor[] };
}

/** Las variables de un bloque del tema, por nombre y sin el `--`. */
type Variables = Record<string, string>;

const fuente = JSON.parse(readFileSync(FUENTE, "utf8")) as Fuente;
const colores = fuente.color.tokens;

/** Parte el tema en sus bloques (`@theme inline`, `:root`, `.dark`). */
function variablesDe(css: string): Record<string, Variables> {
  const bloques: Record<string, Variables> = {};
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const bloque of sinComentarios.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const variables: Variables = {};

    for (const variable of bloque[2].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
      variables[variable[1]] = variable[2].trim();
    }

    bloques[bloque[1].trim()] = variables;
  }

  return bloques;
}

/** En el tema, una referencia de la fuente (`{foreground}`) se emite como `var(--foreground)`. */
function referencia(valor: string): string {
  const alias = valor.match(/^\{(.+)\}$/);
  return alias ? `var(--${alias[1]})` : valor;
}

function valorEnClaro(token: TokenDeColor): string {
  return referencia(typeof token.value === "string" ? token.value : token.value.light);
}

function valorEnOscuro(token: TokenDeColor): string {
  return referencia(typeof token.value === "string" ? token.value : token.value.dark);
}

const tema = variablesDe(generarTema(fuente));
const enClaro = tema[":root"] ?? {};
const enOscuro = tema[".dark"] ?? {};

/** Lo que el tema publica en un modo: el bloque oscuro pisa al claro cuando difiere. */
function publicadoEnOscuro(nombre: string): string | undefined {
  return enOscuro[nombre] ?? enClaro[nombre];
}

describe("el tema generado desde la fuente de valores", () => {
  it("publica los 42 colores de la fuente, con su valor en cada modo", () => {
    expect(colores).toHaveLength(42);

    const faltas: string[] = [];

    for (const token of colores) {
      const esperadoEnClaro = valorEnClaro(token);
      if (enClaro[token.name] !== esperadoEnClaro) {
        faltas.push(
          `--${token.name} en claro: hay ${enClaro[token.name] ?? "(nada)"}, se esperaba ${esperadoEnClaro}`,
        );
      }

      const esperadoEnOscuro = valorEnOscuro(token);
      const hayEnOscuro = publicadoEnOscuro(token.name);
      if (hayEnOscuro !== esperadoEnOscuro) {
        faltas.push(
          `--${token.name} en oscuro: hay ${hayEnOscuro ?? "(nada)"}, se esperaba ${esperadoEnOscuro}`,
        );
      }
    }

    expect(faltas).toEqual([]);
  });

  it("publica los colores de gráfico 1 a 8, sin saltear ninguno, en los dos modos", () => {
    const nombres = [1, 2, 3, 4, 5, 6, 7, 8].map((numero) => `chart-${numero}`);
    const publicados = Object.keys(enClaro).filter((nombre) => /^chart-\d+$/.test(nombre));

    expect(publicados).toEqual(nombres);

    const faltas: string[] = [];

    for (const nombre of nombres) {
      if ((tema["@theme inline"] ?? {})[`color-${nombre}`] !== `var(--${nombre})`) {
        faltas.push(`@theme inline --color-${nombre}: falta la clase del tema`);
      }

      const token = colores.find((color) => color.name === nombre);
      if (!token) {
        faltas.push(`--${nombre}: la fuente de valores no lo tiene`);
        continue;
      }

      if (enClaro[nombre] !== valorEnClaro(token)) {
        faltas.push(`--${nombre} en claro: hay ${enClaro[nombre] ?? "(nada)"}, se esperaba ${valorEnClaro(token)}`);
      }

      if (publicadoEnOscuro(nombre) !== valorEnOscuro(token)) {
        faltas.push(
          `--${nombre} en oscuro: hay ${publicadoEnOscuro(nombre) ?? "(nada)"}, se esperaba ${valorEnOscuro(token)}`,
        );
      }
    }

    expect(faltas).toEqual([]);
  });

  it("publica los estados bueno y atención, en los dos modos", () => {
    const estados = [
      { nombre: "success", significado: "bueno" },
      { nombre: "warning", significado: "atención" },
    ];

    const faltas: string[] = [];

    for (const { nombre, significado } of estados) {
      const token = colores.find((color) => color.name === nombre);

      if (!token) {
        faltas.push(`--${nombre}: falta el estado ${significado} en la fuente de valores`);
        continue;
      }

      if ((tema["@theme inline"] ?? {})[`color-${nombre}`] !== `var(--${nombre})`) {
        faltas.push(`@theme inline --color-${nombre}: falta la clase del tema`);
      }

      if (enClaro[nombre] !== valorEnClaro(token)) {
        faltas.push(`--${nombre} en claro: hay ${enClaro[nombre] ?? "(nada)"}, se esperaba ${valorEnClaro(token)}`);
      }

      if (publicadoEnOscuro(nombre) !== valorEnOscuro(token)) {
        faltas.push(
          `--${nombre} en oscuro: hay ${publicadoEnOscuro(nombre) ?? "(nada)"}, se esperaba ${valorEnOscuro(token)}`,
        );
      }
    }

    expect(faltas).toEqual([]);
  });
});
