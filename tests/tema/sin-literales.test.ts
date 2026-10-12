import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { DESTINOS } from "../../scripts/generar-tema.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SRC = path.join(RAIZ, "src");

/**
 * Lo que escribe el generador del tema no se revisa acá: sus valores salen de la
 * fuente de valores y el test de coincidencia (CA-2) ya comprueba que el archivo
 * sea exactamente lo que el comando genera.
 */
const GENERADOS = new Set(DESTINOS.map((destino) => path.resolve(destino)));

/**
 * El código que genera la CLI de shadcn tampoco se revisa: no se escribe a mano y
 * el preset trae valores propios (por ejemplo `text-[0.8rem]`). Decisión de Germán
 * del 12/10/2026 (ver la decisión 16 y el riesgo 5 de `design.md`).
 */
const DE_LA_HERRAMIENTA = ["components/ui", "hooks"].map((carpeta) => path.join(SRC, carpeta));

/** El código de la app. Los logos y demás imágenes no son texto y quedan afuera. */
const EXTENSIONES = [".ts", ".tsx", ".mjs", ".js", ".jsx", ".css"];

interface Regla {
  que: string;
  patrones: RegExp[];
}

const MEDIDA = String.raw`[\d.]+(?:px|rem|em|%)`;
const COMILLAS = `["'${String.fromCharCode(96)}]?`;

const REGLAS: Regla[] = [
  {
    que: "un color literal",
    patrones: [/#[0-9a-fA-F]{3,8}\b/, /\b(?:rgba?|hsla?|oklcha?|oklab|hwb|lab|lch)\(/i],
  },
  {
    que: "un tamaño de letra literal",
    patrones: [
      new RegExp(String.raw`font-size\s*:\s*${MEDIDA}`),
      new RegExp(String.raw`fontSize\s*:\s*${COMILLAS}${MEDIDA}`),
      new RegExp(String.raw`text-\[[^\]]*${MEDIDA}[^\]]*\]`),
    ],
  },
  {
    que: "un radio literal",
    patrones: [
      new RegExp(String.raw`border-radius\s*:\s*${MEDIDA}`),
      new RegExp(String.raw`borderRadius\s*:\s*${COMILLAS}${MEDIDA}`),
      new RegExp(String.raw`rounded-\[[^\]]*${MEDIDA}[^\]]*\]`),
    ],
  },
];

/** Los literales que hay en un contenido, ya con el archivo y la línea. */
function hallazgos(relativo: string, contenido: string): string[] {
  const encontrados: string[] = [];

  contenido.split("\n").forEach((linea, indice) => {
    for (const regla of REGLAS) {
      const patron = regla.patrones.find((patron) => patron.test(linea));

      if (patron) {
        const muestra = linea.trim().slice(0, 90);
        encontrados.push(`${relativo}:${indice + 1}: ${regla.que} (${patron.source}): ${muestra}`);
      }
    }
  });

  return encontrados;
}

function archivosDe(carpeta: string): string[] {
  const encontrados: string[] = [];

  for (const entrada of readdirSync(carpeta, { withFileTypes: true })) {
    const completo = path.join(carpeta, entrada.name);

    if (entrada.isDirectory()) {
      encontrados.push(...archivosDe(completo));
    } else if (EXTENSIONES.some((extension) => entrada.name.endsWith(extension))) {
      encontrados.push(completo);
    }
  }

  return encontrados;
}

const revisados = archivosDe(SRC)
  .map((archivo) => path.resolve(archivo))
  .filter((archivo) => !GENERADOS.has(archivo))
  .filter((archivo) => !DE_LA_HERRAMIENTA.some((carpeta) => archivo.startsWith(`${carpeta}${path.sep}`)))
  .sort();

describe("ningún valor visual literal en el código de la app (CA-1)", () => {
  it("revisa el código de `src/` y deja afuera lo que escribe el comando y lo que genera la CLI", () => {
    const relativos = revisados.map((archivo) => path.relative(RAIZ, archivo));

    expect(relativos).toContain(path.join("src", "app", "layout.tsx"));
    expect(relativos).toContain(path.join("src", "app", "page.tsx"));
    expect(relativos).toContain(path.join("src", "app", "globals.css"));
    expect(relativos.filter((relativo) => GENERADOS.has(path.join(RAIZ, relativo)))).toEqual([]);
    expect(relativos).not.toContain(path.join("src", "app", "aggility-theme.css"));
    expect(relativos).not.toContain(path.join("src", "components", "ui", "button.tsx"));
    expect(relativos).not.toContain(path.join("src", "hooks", "use-mobile.ts"));
  });

  it("reconoce los literales que tiene que reconocer", () => {
    const muestras = [
      "color: #ff0000;",
      "background: #fff;",
      "color: oklch(0.5 0.1 200);",
      "border: 1px solid rgb(1 2 3);",
      "box-shadow: 0 0 0 2px hsl(200 50% 50%);",
      "font-size: 14px;",
      'fontSize: "1.25rem",',
      'className="text-[13px]"',
      "border-radius: 10px;",
      'borderRadius: "0.5rem",',
      'className="rounded-[6px]"',
    ];

    expect(muestras.flatMap((muestra) => hallazgos("muestra.tsx", muestra))).toHaveLength(muestras.length);

    const limpias = [
      "color: var(--foreground);",
      'className="text-page-title text-muted-foreground"',
      'className="bg-card border-border"',
      'className="gap-4 p-6 size-4"',
      "font-weight: 600;",
      'className="font-medium"',
    ];

    expect(limpias.flatMap((limpia) => hallazgos("limpia.tsx", limpia))).toEqual([]);
  });

  it("no encuentra ningún literal en el código de la app", () => {
    expect(
      revisados.flatMap((archivo) => hallazgos(path.relative(RAIZ, archivo), readFileSync(archivo, "utf8"))),
    ).toEqual([]);
  });
});
