import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { generarTema } from "../../scripts/generar-tema.mjs";

const DIRECTORIO = path.dirname(fileURLToPath(import.meta.url));
const FUENTE = path.join(DIRECTORIO, "..", "..", "sistema", "tokens.json");

interface Estilo {
  name: string;
  fontSize: string;
  lineHeight: string;
  fontWeight: number;
  letterSpacing?: string;
  sample: string;
  usage: string;
}

interface Fuente {
  type: { groups: { name: string; styles: Estilo[] }[] };
}

const fuente = JSON.parse(readFileSync(FUENTE, "utf8")) as Fuente;
const estilos = fuente.type.groups.flatMap((grupo) => grupo.styles);

/**
 * Las declaraciones `--text-…` del tema. En Tailwind v4 cada una de ellas es la
 * clase del mismo nombre sin el prefijo (`--text-page-title` → `text-page-title`),
 * y las que llevan `--` son las propiedades del estilo (alto de línea, peso, interletrado).
 */
function declaraciones(css: string): Record<string, string> {
  const variables: Record<string, string> = {};
  const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");

  for (const variable of sinComentarios.matchAll(/--(text-[\w-]+)\s*:\s*([^;]+);/g)) {
    variables[variable[1]] = variable[2].trim();
  }

  return variables;
}

const tema = declaraciones(generarTema(fuente));

describe("los estilos de texto del tema", () => {
  it("publica una clase por estilo de la fuente, con el mismo nombre y ninguna de más", () => {
    const clases = Object.keys(tema).filter((nombre) => !nombre.includes("--"));

    expect(estilos.map((estilo) => estilo.name)).toEqual([
      "page-title",
      "section-title",
      "card-title",
      "body",
      "body-strong",
      "small",
      "label",
      "kpi-value",
      "kpi-delta",
      "display",
    ]);

    expect(clases).toEqual(estilos.map((estilo) => `text-${estilo.name}`));
  });

  it("le da a cada estilo su tamaño, su alto de línea y su peso", () => {
    const faltas: string[] = [];

    for (const estilo of estilos) {
      const esperadas = [
        [`text-${estilo.name}`, estilo.fontSize],
        [`text-${estilo.name}--line-height`, estilo.lineHeight],
        [`text-${estilo.name}--font-weight`, String(estilo.fontWeight)],
      ];

      for (const [nombre, esperada] of esperadas) {
        if (tema[nombre] !== esperada) {
          faltas.push(`--${nombre}: hay ${tema[nombre] ?? "(nada)"}, se esperaba ${esperada}`);
        }
      }
    }

    expect(faltas).toEqual([]);
  });

  it("le da su interletrado a los estilos que la fuente lo define, y a ningún otro", () => {
    const faltas: string[] = [];

    for (const estilo of estilos) {
      const esperado = estilo.letterSpacing;
      const hay = tema[`text-${estilo.name}--letter-spacing`];

      if (esperado === undefined && hay !== undefined) {
        faltas.push(`--text-${estilo.name}--letter-spacing: la fuente no lo define y el tema publica ${hay}`);
      }

      if (esperado !== undefined && hay !== esperado) {
        faltas.push(
          `--text-${estilo.name}--letter-spacing: hay ${hay ?? "(nada)"}, se esperaba ${esperado}`,
        );
      }
    }

    expect(faltas).toEqual([]);
  });
});
