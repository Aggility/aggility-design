import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

import { describe, expect, it } from "vitest";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const APP = path.join(RAIZ, "src", "app");
const CAPTURAS = path.join(RAIZ, "docs", "capturas");

const MODOS = ["claro", "oscuro"];
const ANCHOS = [
  { nombre: "1280", ancho: 1280 },
  { nombre: "390", ancho: 390 },
];

/** La menor cantidad de colores distintos que puede tener una pantalla con contenido. */
const PISO_DE_COLORES = 30;

/** El nombre de la pantalla a partir de su ruta: `/` es `inicio`, `/clientes/nuevo` es `clientes-nuevo`. */
function nombreDePantalla(ruta: string): string {
  return ruta === "/" ? "inicio" : ruta.replace(/^\//, "").replaceAll("/", "-");
}

/** Las rutas de la app, leídas de sus `page.tsx`: así una pantalla nueva entra sola al juego. */
function rutasDeLaApp(): string[] {
  const rutas: string[] = [];

  function recorrer(directorio: string) {
    for (const entrada of readdirSync(directorio, { withFileTypes: true })) {
      const completo = path.join(directorio, entrada.name);

      if (entrada.isDirectory()) {
        recorrer(completo);
      } else if (entrada.name === "page.tsx") {
        const relativo = path.relative(APP, completo);

        rutas.push(relativo === "page.tsx" ? "/" : `/${relativo.replace(/\/page\.tsx$/, "")}`);
      }
    }
  }

  recorrer(APP);

  return rutas.sort((una, otra) => una.localeCompare(otra));
}

/** Los archivos que el comando de capturas tiene que dejar: pantallas × 2 modos × 2 anchos. */
function juegoEsperado(): { archivo: string; ancho: number }[] {
  return rutasDeLaApp()
    .flatMap((ruta) =>
      MODOS.flatMap((modo) =>
        ANCHOS.map(({ nombre, ancho }) => ({
          archivo: `${nombreDePantalla(ruta)}-${modo}-${nombre}.png`,
          ancho,
        })),
      ),
    )
    .sort((uno, otro) => uno.archivo.localeCompare(otro.archivo));
}

const FIRMA_PNG = [137, 80, 78, 71, 13, 10, 26, 10];

/** El tamaño del PNG, leído de su cabecera. */
function tamañoDePng(datos: Buffer): { ancho: number; alto: number; tipo: number } {
  if (!FIRMA_PNG.every((byte, indice) => datos[indice] === byte)) {
    throw new Error("no es un PNG (le falta la firma)");
  }

  return { ancho: datos.readUInt32BE(16), alto: datos.readUInt32BE(20), tipo: datos[25] };
}

/** Cuántos colores distintos tiene una captura: una pantalla vacía tiene uno o dos. */
function coloresDistintos(datos: Buffer): number {
  const { ancho, alto, tipo } = tamañoDePng(datos);
  const canales = tipo === 6 ? 4 : tipo === 2 ? 3 : 0;

  if (canales === 0 || datos[24] !== 8) {
    throw new Error(`no se sabe leer este PNG (tipo de color ${tipo}, ${datos[24]} bits)`);
  }

  const partes: Buffer[] = [];

  for (let offset = 8; offset < datos.length; ) {
    const largo = datos.readUInt32BE(offset);
    const nombre = datos.toString("ascii", offset + 4, offset + 8);

    if (nombre === "IDAT") {
      partes.push(datos.subarray(offset + 8, offset + 8 + largo));
    }

    if (nombre === "IEND") {
      break;
    }

    offset += 12 + largo;
  }

  const crudo = inflateSync(Buffer.concat(partes));
  const anchoDeFila = ancho * canales;
  const colores = new Set<string>();
  let anterior = Buffer.alloc(anchoDeFila);
  let posicion = 0;

  for (let fila = 0; fila < alto && colores.size <= PISO_DE_COLORES * 4; fila += 1) {
    const filtro = crudo[posicion];
    posicion += 1;

    const linea = Buffer.from(crudo.subarray(posicion, posicion + anchoDeFila));
    posicion += anchoDeFila;

    // Se deshace el filtro de la fila, que es lo que hace que el PNG comprima.
    for (let i = 0; i < anchoDeFila; i += 1) {
      const izquierda = i >= canales ? linea[i - canales] : 0;
      const arriba = anterior[i];
      const arribaIzquierda = i >= canales ? anterior[i - canales] : 0;
      let valor = linea[i];

      if (filtro === 1) {
        valor += izquierda;
      } else if (filtro === 2) {
        valor += arriba;
      } else if (filtro === 3) {
        valor += Math.floor((izquierda + arriba) / 2);
      } else if (filtro === 4) {
        const estimado = izquierda + arriba - arribaIzquierda;
        const distancias = [
          Math.abs(estimado - izquierda),
          Math.abs(estimado - arriba),
          Math.abs(estimado - arribaIzquierda),
        ];
        const menor = Math.min(...distancias);

        valor += menor === distancias[0] ? izquierda : menor === distancias[1] ? arriba : arribaIzquierda;
      }

      linea[i] = valor & 0xff;
    }

    anterior = linea;

    for (let x = 0; x < anchoDeFila; x += canales) {
      colores.add(`${linea[x]},${linea[x + 1]},${linea[x + 2]}`);
    }
  }

  return colores.size;
}

describe("el juego de capturas (CA-10)", () => {
  const esperadas = juegoEsperado();

  it("está cada captura de cada pantalla, modo y ancho, y ninguna suelta", () => {
    const faltan = esperadas.filter(({ archivo }) => !existsSync(path.join(CAPTURAS, archivo)));
    const sobran = readdirSync(CAPTURAS).filter(
      (archivo) => !esperadas.some((esperada) => esperada.archivo === archivo),
    );

    expect(faltan.map(({ archivo }) => archivo), "no puede faltar ninguna captura").toEqual([]);
    expect(sobran, "no puede haber capturas de pantallas que ya no están").toEqual([]);
  });

  it("cada captura tiene el tamaño del ancho que le toca y no está vacía", () => {
    const problemas: string[] = [];

    for (const { archivo, ancho } of esperadas) {
      const completo = path.join(CAPTURAS, archivo);

      if (!existsSync(completo)) {
        continue; // Ya lo nombra el caso de arriba.
      }

      try {
        const datos = readFileSync(completo);
        const { ancho: medido } = tamañoDePng(datos);

        if (medido !== ancho) {
          problemas.push(`${archivo}: mide ${medido} px de ancho y le tocan ${ancho}`);
        }

        const colores = coloresDistintos(datos);

        if (colores < PISO_DE_COLORES) {
          problemas.push(`${archivo}: parece vacía (sólo ${colores} colores)`);
        }
      } catch (error) {
        problemas.push(`${archivo}: ${(error as Error).message}`);
      }
    }

    expect(problemas).toEqual([]);
  });

  it("son 24: 6 pantallas × 2 modos × 2 anchos", () => {
    expect(rutasDeLaApp(), "las pantallas de la app").toHaveLength(6);
    expect(esperadas, "el juego completo").toHaveLength(24);
    expect(statSync(CAPTURAS).isDirectory()).toBe(true);
  });
});
