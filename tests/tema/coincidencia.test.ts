import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { DESTINOS, generarTema, leerFuente } from "../../scripts/generar-tema.mjs";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

const fuente = leerFuente();
const generado = generarTema(fuente);

/** La primera línea que no coincide entre lo que hay y lo que el comando genera. */
function diferencia(archivo: string, hay: string): string | null {
  const lineasGeneradas = generado.split("\n");
  const lineasDelArchivo = hay.split("\n");
  const total = Math.max(lineasGeneradas.length, lineasDelArchivo.length);

  for (let numero = 0; numero < total; numero += 1) {
    if (lineasGeneradas[numero] !== lineasDelArchivo[numero]) {
      const enArchivo = JSON.stringify(lineasDelArchivo[numero] ?? "(el archivo termina antes)");
      const enTema = JSON.stringify(lineasGeneradas[numero] ?? "(el comando genera una línea de más)");

      return `${archivo} línea ${numero + 1}: dice ${enArchivo}; el comando genera ${enTema}`;
    }
  }

  return null;
}

function contenidoDe(archivo: string): string | null {
  try {
    return readFileSync(archivo, "utf8");
  } catch {
    return null;
  }
}

describe("el tema publicado coincide con lo que el comando genera (CA-2)", () => {
  it("el comando escribe el tema canónico y la copia que consume la app", () => {
    expect(DESTINOS.map((destino) => path.relative(RAIZ, destino))).toEqual([
      "sistema/aggility-theme.css",
      "src/app/aggility-theme.css",
    ]);
  });

  it("los dos archivos son, línea por línea, lo que el comando genera", () => {
    const faltas = DESTINOS.map((destino) => {
      const relativo = path.relative(RAIZ, destino);
      const hay = contenidoDe(destino);

      if (hay === null) {
        return `${relativo}: no está (lo escribe \`npm run tema\`)`;
      }

      return diferencia(relativo, hay);
    }).filter((falta) => falta !== null);

    expect(faltas).toEqual([]);
  });

  it("el tema se puede copiar solo: declara que es generado, desde qué fuente y con qué fecha, y no trae nada de afuera", () => {
    const [anio, mes, dia] = (fuente.meta.synced as string).split("-");
    const encabezado = generado.split("\n").slice(0, 7).join("\n");

    expect(encabezado).toContain("Generado desde el sistema de diseño");
    expect(encabezado).toContain("tokens.json");
    expect(encabezado).toContain(`${dia}/${mes}/${anio}`);
    expect(generado).not.toMatch(/^\s*@import\b/m);
  });
});
