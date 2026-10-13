import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * La pantalla de fundamentos: los colores con su nombre, su valor y su uso (sección 5.2).
 *
 * Lo que se espera no está escrito acá: sale de `sistema/tokens.json`, la fuente de valores.
 * El contrato de la pantalla es que cada color es un elemento con `data-color="<nombre>"` que
 * muestra el nombre, el uso y —en un elemento con `data-valor`— el valor del modo activo.
 */

// Playwright corre desde la raíz del proyecto (y transpila a CommonJS, así que `import.meta` no
// está disponible acá).
const RAIZ = process.cwd();
const FUENTE = JSON.parse(readFileSync(path.join(RAIZ, "sistema", "tokens.json"), "utf8"));

type Color = { name: string; value: string | { light: string; dark: string }; usage: string };

const COLORES: Color[] = FUENTE.color.tokens;
const MODOS = { claro: "light", oscuro: "dark" } as const;

/** El valor que la fuente define para un modo. */
function valorEn(color: Color, modo: keyof typeof MODOS): string {
  return typeof color.value === "string" ? color.value : color.value[MODOS[modo]];
}

/** Entra a la pantalla y fija el modo del sistema, que es el que la app sigue de entrada. */
async function abrirEn(page: Page, modo: keyof typeof MODOS): Promise<void> {
  await page.emulateMedia({ colorScheme: MODOS[modo] });
  await page.goto("/fundamentos");

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fundamentos");
}

test.describe("la tabla de colores de fundamentos", () => {
  test("cada color del tema se ve con su nombre, su valor y su uso", async ({ page }) => {
    await abrirEn(page, "claro");

    const faltantes: string[] = [];

    for (const color of COLORES) {
      const fila = page.locator(`[data-color="${color.name}"]`);

      if ((await fila.count()) === 0) {
        faltantes.push(`${color.name}: no está en la pantalla`);
        continue;
      }

      const texto = (await fila.first().innerText()).replace(/\s+/g, " ");

      if (!texto.includes(color.name)) {
        faltantes.push(`${color.name}: no muestra su nombre`);
      }

      const valor = await fila.first().locator("[data-valor]").innerText();

      if (valor.trim() !== valorEn(color, "claro")) {
        faltantes.push(`${color.name}: muestra "${valor.trim()}" y en claro vale "${valorEn(color, "claro")}"`);
      }

      if (color.usage && !texto.includes(color.usage.replace(/\s+/g, " "))) {
        faltantes.push(`${color.name}: no muestra para qué se usa`);
      }
    }

    expect(faltantes, "los 42 colores de la fuente, con nombre, valor y uso").toEqual([]);
    expect(await page.locator("[data-color]").count()).toBe(COLORES.length);
  });

  test("los valores que se muestran son los del modo activo", async ({ page }) => {
    // Se busca un color que de verdad cambie entre modos: hay colores del tema que valen lo mismo
    // en claro y en oscuro, y con esos el caso no probaría nada.
    const cambia = COLORES.find((color) => valorEn(color, "claro") !== valorEn(color, "oscuro"));

    expect(cambia, "la fuente tiene colores que cambian de valor entre modos").toBeTruthy();

    await abrirEn(page, "claro");

    await expect(page.locator(`[data-color="${cambia!.name}"] [data-valor]`), "el valor del modo claro").toHaveText(
      valorEn(cambia!, "claro"),
    );

    await page.emulateMedia({ colorScheme: "dark" });
    await page.reload();

    await expect(page.locator(`[data-color="${cambia!.name}"] [data-valor]`), "y el del modo oscuro").toHaveText(
      valorEn(cambia!, "oscuro"),
    );

    // Cambiar de modo no puede borrar la tabla: se sigue viendo qué color es cada uno.
    await expect(page.locator("[data-color]")).toHaveCount(COLORES.length);
    await expect(page.locator(`[data-color="${cambia!.name}"]`)).toContainText(cambia!.name);
  });

  test("un color de marca con un solo valor se ve igual en los dos modos", async ({ page }) => {
    // Los colores de marca valen lo mismo en claro y en oscuro: la pantalla tiene que mostrarlos
    // con ese único valor en los dos modos, junto a los que sí cambian.
    const deMarca = COLORES.filter((color) => typeof color.value === "string");

    expect(deMarca.length, "la fuente tiene colores de marca con un solo valor").toBeGreaterThan(0);

    const leidos = new Map<string, Record<string, string>>();

    for (const modo of ["claro", "oscuro"] as const) {
      await abrirEn(page, modo);

      for (const color of deMarca) {
        const valor = (await page.locator(`[data-color="${color.name}"] [data-valor]`).innerText()).trim();

        leidos.set(color.name, { ...leidos.get(color.name), [modo]: valor });
      }
    }

    const fallas = deMarca
      .filter((color) => {
        const visto = leidos.get(color.name);

        return visto?.claro !== valorEn(color, "claro") || visto?.oscuro !== visto?.claro;
      })
      .map((color) => {
        const visto = leidos.get(color.name);

        return `${color.name}: en claro "${visto?.claro}" y en oscuro "${visto?.oscuro}" (la fuente dice "${valorEn(color, "claro")}")`;
      });

    expect(fallas, "los colores de marca valen lo mismo en los dos modos").toEqual([]);
  });
});
