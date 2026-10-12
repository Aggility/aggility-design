/**
 * Genera el tema de Aggility desde la fuente de valores (`sistema/tokens.json`).
 *
 * El tema es la única pieza que copian las apps: un archivo autocontenido de
 * Tailwind v4 + shadcn/ui (`@theme inline`, `:root` y `.dark`). No se edita ni se
 * arma a mano en ninguna app: se cambia la fuente y se vuelve a generar.
 *
 * Sin dependencias. Se ejecuta con `npm run tema`.
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** La fuente de valores: única y compartida por todo el sistema de diseño. */
export const FUENTE = path.join(RAIZ, "sistema", "tokens.json");

/** Los archivos que el generador escribe. */
export const DESTINOS = [path.join(RAIZ, "sistema", "aggility-theme.css")];

/** Proporción de cada radio respecto del radio base (`radius-lg` de la fuente). */
const RADIOS = [
  { nombre: "sm", proporcion: 0.6 },
  { nombre: "md", proporcion: 0.8 },
  { nombre: "lg", proporcion: 1 },
  { nombre: "xl", proporcion: 1.4 },
];

/** Las familias que la app carga con `next/font` entran por su variable, no por su nombre. */
const FAMILIAS_CARGADAS = { Inter: "var(--font-inter)" };

/** Lee la fuente de valores. Falla nombrando el archivo en lugar de seguir sin valores. */
export function leerFuente(ruta = FUENTE) {
  let crudo;

  try {
    crudo = readFileSync(ruta, "utf8");
  } catch {
    throw new Error(`No se pudo leer la fuente de valores: falta ${ruta}.`);
  }

  try {
    return JSON.parse(crudo);
  } catch (error) {
    throw new Error(`La fuente de valores ${ruta} no es un JSON válido: ${error.message}`);
  }
}

/** Los colores de la fuente, validados: ninguno puede quedarse sin valor en un modo. */
function coloresDe(fuente) {
  const tokens = fuente?.color?.tokens;

  if (!Array.isArray(tokens) || tokens.length === 0) {
    throw new Error("La fuente de valores no trae colores (color.tokens).");
  }

  for (const token of tokens) {
    const { name, value } = token ?? {};

    if (typeof name !== "string" || name === "") {
      throw new Error("La fuente de valores trae un color sin nombre.");
    }

    if (typeof value === "string") continue;

    for (const modo of ["light", "dark"]) {
      const delModo = value?.[modo];

      if (typeof delModo !== "string" || delModo === "") {
        throw new Error(`Al color ${name} le falta el valor del modo ${modo} en la fuente de valores.`);
      }
    }
  }

  return tokens;
}

/** La fecha de sincronización de la fuente, en `dd/mm/aaaa`. */
function fechaDe(fuente) {
  const synced = fuente?.meta?.synced;

  if (typeof synced !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(synced)) {
    throw new Error("La fuente de valores no dice de cuándo es (meta.synced).");
  }

  const [anio, mes, dia] = synced.split("-");
  return `${dia}/${mes}/${anio}`;
}

/** Un valor que en la fuente refiere a otro (`{foreground}`) en el tema es `var(--foreground)`. */
function conReferencias(valor) {
  const alias = /^\{(.+)\}$/.exec(valor);
  return alias ? `var(--${alias[1]})` : valor;
}

function enClaro(token) {
  return conReferencias(typeof token.value === "string" ? token.value : token.value.light);
}

function enOscuro(token) {
  return conReferencias(typeof token.value === "string" ? token.value : token.value.dark);
}

/** Un color con el mismo valor en los dos modos se declara una sola vez. */
function cambiaEnOscuro(token) {
  return enOscuro(token) !== enClaro(token);
}

/** Las tres variables de tipografía del tema. */
function tipografiaDe(fuente) {
  const familias = fuente?.type?.families;

  if (typeof familias?.sans !== "string" || typeof familias?.mono !== "string") {
    throw new Error("La fuente de valores no trae las familias tipográficas (type.families).");
  }

  return [
    `--font-sans: ${enFamiliaCargada(familias.sans)};`,
    `--font-mono: ${familias.mono};`,
    "--font-heading: var(--font-sans);",
  ];
}

function enFamiliaCargada(familia) {
  const [primera, ...resto] = familia.split(",");
  const variable = FAMILIAS_CARGADAS[primera.trim()];

  return variable ? [variable, ...resto].join(",") : familia;
}

/** Los estilos de texto de la fuente: los de interfaz, los de datos y el de marca. */
function estilosDe(fuente) {
  const grupos = fuente?.type?.groups;

  if (!Array.isArray(grupos) || grupos.length === 0) {
    throw new Error("La fuente de valores no trae estilos de texto (type.groups).");
  }

  const estilos = [];

  for (const grupo of grupos) {
    for (const estilo of grupo?.styles ?? []) {
      const { name, fontSize, lineHeight, fontWeight, letterSpacing } = estilo ?? {};

      if (typeof name !== "string" || name === "") {
        throw new Error(`La fuente de valores trae un estilo de texto sin nombre en el grupo ${grupo?.name}.`);
      }

      const medidas = { fontSize, lineHeight, fontWeight };

      for (const [campo, valor] of Object.entries(medidas)) {
        if (valor === undefined || valor === null || valor === "") {
          throw new Error(`Al estilo ${name} le falta ${campo} en la fuente de valores.`);
        }
      }

      estilos.push({ name, fontSize, lineHeight, fontWeight, letterSpacing });
    }
  }

  if (estilos.length === 0) {
    throw new Error("La fuente de valores no trae ningún estilo de texto (type.groups[].styles).");
  }

  return estilos;
}

/**
 * Cada estilo entra como una clase de texto de Tailwind v4 (`--text-page-title`
 * es `text-page-title`) con su alto de línea, su peso y —si la fuente lo define—
 * su interletrado.
 */
function lineasDeEstilos(fuente) {
  return estilosDe(fuente).flatMap(({ name, fontSize, lineHeight, fontWeight, letterSpacing }) => [
    `--text-${name}: ${fontSize};`,
    `--text-${name}--line-height: ${lineHeight};`,
    `--text-${name}--font-weight: ${fontWeight};`,
    ...(typeof letterSpacing === "string" && letterSpacing !== "" ? [`--text-${name}--letter-spacing: ${letterSpacing};`] : []),
  ]);
}

/** El radio base en rem, desde `radius-lg` de la fuente. */
function radioBaseDe(fuente) {
  const tokens = fuente?.radius?.tokens ?? [];
  const base = tokens.find((token) => token?.name === "radius-lg");

  if (typeof base?.value !== "string" || !/^[\d.]+px$/.test(base.value)) {
    throw new Error("La fuente de valores no trae el radio base en píxeles (radius radius-lg).");
  }

  return Number.parseFloat(base.value) / 16;
}

function enRem(rem) {
  return `${Number(rem.toFixed(4))}rem`;
}

/**
 * El tema completo como texto. Es puro: se genera entero en memoria antes de
 * escribir nada, así un error nunca deja un tema a medias.
 */
export function generarTema(fuente) {
  const colores = coloresDe(fuente);
  const lineas = [
    "/* Aggility — tema común de las apps (Tailwind v4 + shadcn/ui).",
    ` * Generado desde el sistema de diseño "Aggility" (tokens.json, ${fechaDe(fuente)}).`,
    " * No editar a mano en cada app: cambiar el sistema y volver a copiar este archivo.",
    ' * Uso: en globals.css, después de los @import de tailwind y shadcn:  @import "./aggility-theme.css";',
    " * Modo oscuro con la clase .dark en <html> (el variant de shadcn: @custom-variant dark (&:is(.dark *));).",
    " * Fuente: Inter con next/font/google, variable --font-inter.",
    " */",
    "",
    "@theme inline {",
    ...tipografiaDe(fuente).map((linea) => `  ${linea}`),
    ...lineasDeEstilos(fuente).map((linea) => `  ${linea}`),
    ...colores.map((token) => `  --color-${token.name}: var(--${token.name});`),
    ...RADIOS.map(({ nombre, proporcion }) =>
      proporcion === 1
        ? "  --radius-lg: var(--radius);"
        : `  --radius-${nombre}: calc(var(--radius) * ${proporcion});`,
    ),
    "}",
    "",
    ":root {",
    `  --radius: ${enRem(radioBaseDe(fuente))};`,
    ...colores.map((token) => `  --${token.name}: ${enClaro(token)};`),
    "}",
    "",
    ".dark {",
    ...colores.filter(cambiaEnOscuro).map((token) => `  --${token.name}: ${enOscuro(token)};`),
    "  color-scheme: dark;",
    "}",
  ];

  return `${lineas.join("\n")}\n`;
}

/** Genera el tema desde la fuente y lo escribe en todos sus destinos. */
export function escribirTema(rutaFuente = FUENTE) {
  const fuente = leerFuente(rutaFuente);
  const css = generarTema(fuente);

  for (const destino of DESTINOS) {
    writeFileSync(destino, css);
  }

  return { fuente, css };
}

const enEjecucionDirecta =
  typeof process.argv[1] === "string" && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (enEjecucionDirecta) {
  try {
    const { css } = escribirTema();

    for (const destino of DESTINOS) {
      console.log(`Tema generado: ${path.relative(RAIZ, destino)} (${css.length} caracteres)`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
