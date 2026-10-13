import { readFileSync } from "node:fs";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

/**
 * La pantalla de fundamentos: los colores con su nombre, su valor y su uso, y los estilos de
 * texto aplicados (sección 5.2).
 *
 * Lo que se espera no está escrito acá: sale de `sistema/tokens.json`, la fuente de valores.
 * El contrato de la pantalla es que cada color es un elemento con `data-color="<nombre>"` que
 * muestra el nombre, el uso y —en un elemento con `data-valor`— el valor del modo activo, y que
 * cada estilo de texto es un elemento con `data-estilo="<nombre>"` que muestra el nombre, sus
 * medidas en elementos con `data-medida` (tamaño, alto de línea y peso), el uso, y el texto de
 * ejemplo de la fuente aplicado en un elemento con `data-muestra`.
 */

// Playwright corre desde la raíz del proyecto (y transpila a CommonJS, así que `import.meta` no
// está disponible acá).
const RAIZ = process.cwd();
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

test.describe("los estilos de texto de fundamentos", () => {
  test("cada estilo de la fuente se ve aplicado, con su nombre, sus medidas y su uso", async ({ page }) => {
    await abrirEn(page, "claro");

    const faltantes: string[] = [];

    for (const estilo of ESTILOS) {
      const fila = page.locator(`[data-estilo="${estilo.name}"]`);

      if ((await fila.count()) === 0) {
        faltantes.push(`${estilo.name}: no está en la pantalla`);
        continue;
      }

      const texto = (await fila.first().innerText()).replace(/\s+/g, " ");

      if (!texto.includes(estilo.name)) {
        faltantes.push(`${estilo.name}: no muestra su nombre`);
      }

      const muestra = (await fila.first().locator("[data-muestra]").innerText()).trim();

      if (muestra !== estilo.sample) {
        faltantes.push(`${estilo.name}: el texto de ejemplo dice "${muestra}" y la fuente dice "${estilo.sample}"`);
      }

      const medidas: Record<string, string> = {
        tamano: estilo.fontSize,
        linea: estilo.lineHeight,
        peso: String(estilo.fontWeight),
      };

      for (const [cual, esperada] of Object.entries(medidas)) {
        const vista = (await fila.first().locator(`[data-medida="${cual}"]`).innerText()).trim();

        if (vista !== esperada) {
          faltantes.push(`${estilo.name}: ${cual} dice "${vista}" y la fuente dice "${esperada}"`);
        }
      }

      if (estilo.usage && !texto.includes(estilo.usage.replace(/\s+/g, " "))) {
        faltantes.push(`${estilo.name}: no muestra para qué se usa`);
      }
    }

    expect(faltantes, "los estilos de texto de la fuente, aplicados y con sus medidas al lado").toEqual([]);
    expect(await page.locator("[data-estilo]").count()).toBe(ESTILOS.length);
  });

  test("cada estilo se dibuja con el tamaño, el alto de línea y el peso de la fuente", async ({ page }) => {
    // Que la medida esté escrita al lado no alcanza: el estilo tiene que estar **aplicado**. Acá
    // se mide lo que el navegador dibuja sobre el texto de ejemplo.
    await abrirEn(page, "claro");

    const fallas: string[] = [];

    for (const estilo of ESTILOS) {
      const dibujado = await page.locator(`[data-estilo="${estilo.name}"] [data-muestra]`).evaluate((el) => {
        const computado = getComputedStyle(el);

        return { tamano: computado.fontSize, linea: computado.lineHeight, peso: computado.fontWeight };
      });

      if (dibujado.tamano !== estilo.fontSize) {
        fallas.push(`${estilo.name}: se dibuja en ${dibujado.tamano} y la fuente dice ${estilo.fontSize}`);
      }

      if (dibujado.linea !== estilo.lineHeight) {
        fallas.push(`${estilo.name}: con alto de línea ${dibujado.linea} y la fuente dice ${estilo.lineHeight}`);
      }

      if (dibujado.peso !== String(estilo.fontWeight)) {
        fallas.push(`${estilo.name}: con peso ${dibujado.peso} y la fuente dice ${estilo.fontWeight}`);
      }
    }

    expect(fallas, "cada estilo aplicado con las medidas de la fuente").toEqual([]);
  });

  test("todos los estilos usan la misma familia y ningún peso fuera de los de la fuente", async ({ page }) => {
    await abrirEn(page, "claro");

    const familias = new Map<string, string>();
    const pesosDeLaFuente = ESTILOS.map((estilo) => String(estilo.fontWeight));

    for (const estilo of ESTILOS) {
      const computado = await page.locator(`[data-estilo="${estilo.name}"] [data-muestra]`).evaluate((el) => {
        const dibujado = getComputedStyle(el);

        return { familia: dibujado.fontFamily, peso: dibujado.fontWeight };
      });

      familias.set(computado.familia, familias.get(computado.familia) ?? estilo.name);

      expect(pesosDeLaFuente, `"${estilo.name}" se dibuja con un peso que la fuente define`).toContain(
        computado.peso,
      );
    }

    // Una sola familia en toda la pantalla, y la misma que carga la app: si alguna cayera en una
    // de reserva, acá aparecería una segunda familia.
    const delCuerpo = await page.evaluate(() => getComputedStyle(document.body).fontFamily);

    expect([...familias.keys()], "una sola familia tipográfica").toHaveLength(1);
    expect([...familias.keys()], "y es la que la app carga").toEqual([delCuerpo]);
    expect([...familias.keys()][0], "la familia es Inter").toContain("Inter");
  });
});

test.describe("la escala de espacio y los radios de fundamentos", () => {
  test("cada medida de la escala de espacio se ve con su nombre, su medida y un ejemplo", async ({ page }) => {
    // El contrato de la pantalla: cada medida es un elemento con `data-espacio="<nombre>"` que
    // muestra el nombre, el uso, la medida en un `[data-medida]` y un ejemplo visible con
    // `data-ejemplo`, cuya separación el navegador dibuja del tamaño que la fuente dice.
    await abrirEn(page, "claro");

    const faltantes: string[] = [];

    for (const espacio of ESPACIOS) {
      const fila = page.locator(`[data-espacio="${espacio.name}"]`);

      if ((await fila.count()) === 0) {
        faltantes.push(`${espacio.name}: no está en la pantalla`);
        continue;
      }

      const texto = (await fila.first().innerText()).replace(/\s+/g, " ");

      if (!texto.includes(espacio.name)) {
        faltantes.push(`${espacio.name}: no muestra su nombre`);
      }

      const medida = (await fila.first().locator("[data-medida]").innerText()).trim();

      if (medida !== espacio.value) {
        faltantes.push(`${espacio.name}: dice "${medida}" y la fuente dice "${espacio.value}"`);
      }

      if (espacio.usage && !texto.includes(espacio.usage.replace(/\s+/g, " "))) {
        faltantes.push(`${espacio.name}: no muestra para qué se usa`);
      }

      // Que la medida esté escrita no alcanza: el ejemplo tiene que dibujar esa separación entre
      // sus dos cuadros. Se mide lo dibujado, no la declaración: un ejemplo sin nada adentro
      // también tendría el `gap` puesto.
      const dibujado = await fila
        .first()
        .locator("[data-ejemplo]")
        .evaluate((el) => {
          const [uno, dos] = [...el.children].map((hijo) => hijo.getBoundingClientRect());

          if (!uno || !dos) {
            return { separacion: "sin ejemplo", visible: false };
          }

          return {
            separacion: `${Math.round(dos.left - uno.right)}px`,
            visible: uno.width > 0 && uno.height > 0 && dos.width > 0 && dos.height > 0,
          };
        });

      if (!dibujado.visible) {
        faltantes.push(`${espacio.name}: el ejemplo no muestra nada`);
      }

      if (dibujado.separacion !== espacio.value) {
        faltantes.push(
          `${espacio.name}: el ejemplo se dibuja con ${dibujado.separacion} de separación y la fuente dice ${espacio.value}`,
        );
      }
    }

    expect(faltantes, "la escala de espacio, con su nombre, su medida y su ejemplo").toEqual([]);
    expect(await page.locator("[data-espacio]").count()).toBe(ESPACIOS.length);
  });

  test("cada radio se ve con su medida sobre un elemento del mismo tamaño, para compararlos", async ({ page }) => {
    await abrirEn(page, "claro");

    const faltantes: string[] = [];
    const tamanos = new Set<string>();

    for (const radio of RADIOS) {
      const fila = page.locator(`[data-radio="${radio.name}"]`);

      if ((await fila.count()) === 0) {
        faltantes.push(`${radio.name}: no está en la pantalla`);
        continue;
      }

      const texto = (await fila.first().innerText()).replace(/\s+/g, " ");

      if (!texto.includes(radio.name)) {
        faltantes.push(`${radio.name}: no muestra su nombre`);
      }

      const medida = (await fila.first().locator("[data-medida]").innerText()).trim();

      if (medida !== radio.value) {
        faltantes.push(`${radio.name}: dice "${medida}" y la fuente dice "${radio.value}"`);
      }

      const ejemplo = await fila
        .first()
        .locator("[data-ejemplo]")
        .evaluate((el) => {
          const dibujado = getComputedStyle(el);
          const caja = el.getBoundingClientRect();

          return {
            radio: dibujado.borderTopLeftRadius,
            tamanio: `${Math.round(caja.width)}×${Math.round(caja.height)}`,
          };
        });

      if (ejemplo.radio !== radio.value) {
        faltantes.push(`${radio.name}: el ejemplo se dibuja con ${ejemplo.radio} y la fuente dice ${radio.value}`);
      }

      tamanos.add(ejemplo.tamanio);
    }

    expect(faltantes, "los radios, con su medida y su ejemplo").toEqual([]);
    expect(await page.locator("[data-radio]").count()).toBe(RADIOS.length);
    expect([...tamanos], "todos los ejemplos del mismo tamaño, para poder compararlos").toHaveLength(1);
  });
});
