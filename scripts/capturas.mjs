#!/usr/bin/env node
/**
 * Capturas de las pantallas (CA-10).
 *
 * Recorre las pantallas que existen de verdad —los `page.tsx` de `src/app`, no una lista
 * escrita a mano— y guarda una captura por pantalla, por modo y por ancho en
 * `docs/capturas/`, con el nombre `<pantalla>-<claro|oscuro>-<1280|390>.png`.
 *
 * Levanta la app compilada (`next build` + `next start`) en un puerto propio, espera a que la
 * tipografía esté lista y falla nombrando la pantalla si alguna no renderiza.
 *
 * Uso: `npm run capturas`
 */

import { spawn } from "node:child_process";
import { mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(RAIZ, "src", "app");
const DESTINO = path.join(RAIZ, "docs", "capturas");

const PUERTO = 3400;
const URL_BASE = `http://localhost:${PUERTO}`;

/** Los modos y los anchos del juego de capturas, en el orden en que se guardan. */
const MODOS = ["claro", "oscuro"];
const ANCHOS = [
  { nombre: "1280", viewport: { width: 1280, height: 900 } },
  { nombre: "390", viewport: { width: 390, height: 844 } },
];

/** El nombre de la pantalla a partir de su ruta: `/` es `inicio`, `/clientes/nuevo` es `clientes-nuevo`. */
function nombreDePantalla(ruta) {
  if (ruta === "/") {
    return "inicio";
  }

  return ruta.replace(/^\//, "").replaceAll("/", "-");
}

/** Las rutas de la app, leídas de sus `page.tsx` (asi una pantalla nueva queda cubierta sola). */
async function rutasDeLaApp() {
  const rutas = [];

  async function recorrer(directorio) {
    for (const entrada of await readdir(directorio, { withFileTypes: true })) {
      const completo = path.join(directorio, entrada.name);

      if (entrada.isDirectory()) {
        await recorrer(completo);
        continue;
      }

      if (entrada.name !== "page.tsx") {
        continue;
      }

      const relativo = path.relative(APP, completo);

      rutas.push(relativo === "page.tsx" ? "/" : `/${relativo.replace(/\/page\.tsx$/, "")}`);
    }
  }

  await recorrer(APP);

  return rutas.sort((una, otra) => una.localeCompare(otra));
}

/** Los archivos del juego esperado: pantallas × 2 modos × 2 anchos. */
function nombresEsperados(rutas) {
  return rutas
    .flatMap((ruta) => MODOS.flatMap((modo) => ANCHOS.map(({ nombre }) => `${nombreDePantalla(ruta)}-${modo}-${nombre}.png`)))
    .sort();
}

/** Corre un comando y espera a que termine; devuelve la salida. */
function correr(comando, argumentos) {
  return new Promise((resolver, rechazar) => {
    const proceso = spawn(comando, argumentos, { cwd: RAIZ, stdio: "inherit" });

    proceso.on("error", rechazar);
    proceso.on("close", (codigo) =>
      codigo === 0 ? resolver() : rechazar(new Error(`${comando} ${argumentos.join(" ")} falló con ${codigo}`)),
    );
  });
}

/** Levanta la app compilada y devuelve el proceso, o falla si no llega a responder. */
async function levantarLaApp() {
  const servidor = spawn("npx", ["next", "start", "--port", String(PUERTO)], {
    cwd: RAIZ,
    stdio: "ignore",
  });

  const limite = Date.now() + 60_000;

  while (Date.now() < limite) {
    try {
      const respuesta = await fetch(URL_BASE);

      if (respuesta.ok) {
        return servidor;
      }
    } catch {
      // Todavía no atiende: se espera un poco más.
    }

    await new Promise((seguir) => setTimeout(seguir, 300));
  }

  servidor.kill();

  throw new Error(`la app no respondió en ${URL_BASE} en 60 segundos`);
}

async function main() {
  const rutas = await rutasDeLaApp();

  if (rutas.length === 0) {
    throw new Error("no se encontró ninguna pantalla en src/app (ningún page.tsx)");
  }

  console.log(`Pantallas: ${rutas.map((ruta) => nombreDePantalla(ruta)).join(", ")}`);
  console.log("Compilando la app…");
  await correr("npm", ["run", "build"]);

  // Se limpia el juego anterior: así no quedan capturas sueltas de pantallas que ya no están.
  await rm(DESTINO, { recursive: true, force: true });
  await mkdir(DESTINO, { recursive: true });

  const servidor = await levantarLaApp();
  const navegador = await chromium.launch();

  try {
    for (const ruta of rutas) {
      const pantalla = nombreDePantalla(ruta);

      for (const modo of MODOS) {
        for (const { nombre: ancho, viewport } of ANCHOS) {
          const contexto = await navegador.newContext({ viewport });
          const pagina = await contexto.newPage();
          const problemas = [];

          pagina.on("pageerror", (error) => problemas.push(`error de página: ${error.message}`));

          // El modo se fuerza por los dos lados: la elección guardada y el modo del sistema.
          await contexto.addInitScript((elegido) => {
            try {
              localStorage.setItem("theme", elegido);
            } catch {
              // En `about:blank` no hay almacenamiento: no hace falta.
            }
          }, modo === "oscuro" ? "dark" : "light");
          await pagina.emulateMedia({ colorScheme: modo === "oscuro" ? "dark" : "light" });

          const respuesta = await pagina.goto(`${URL_BASE}${ruta}`, { waitUntil: "load" });

          await pagina.waitForLoadState("networkidle");
          await pagina.evaluate(() => document.fonts.ready);

          const titulo = await pagina.locator("header h1").first().textContent();

          if (!respuesta?.ok() || !titulo?.trim()) {
            problemas.push(`la pantalla no renderizó (estado ${respuesta?.status() ?? "?"})`);
          }

          if (problemas.length > 0) {
            throw new Error(`"${pantalla}" no se pudo capturar: ${problemas.join("; ")}`);
          }

          await pagina.screenshot({
            path: path.join(DESTINO, `${pantalla}-${modo}-${ancho}.png`),
            fullPage: true,
          });

          await contexto.close();
          console.log(`  ${pantalla}-${modo}-${ancho}.png`);
        }
      }
    }
  } finally {
    await navegador.close();
    servidor.kill();
  }

  const esperados = nombresEsperados(rutas);
  console.log(
    `\n${esperados.length} capturas en docs/capturas (${rutas.length} pantallas × 2 modos × 2 anchos).`,
  );
}

main().catch((error) => {
  console.error(`\nNo se pudieron generar las capturas: ${error.message}`);
  process.exitCode = 1;
});
