import { expect, test, type Locator, type Page } from "@playwright/test";

const BOTON = "Menú de secciones";
const ITEMS = ["Inicio", "Fundamentos", "Clientes", "Nuevo cliente", "Ingreso", "Estados"];

const esAngosto = (page: Page): boolean => (page.viewportSize()?.width ?? 0) < 800;

/** El color de un valor del tema, resuelto por el navegador: el test no escribe colores. */
function colorDelTema(page: Page, variable: string): Promise<string> {
  return page.evaluate((nombre) => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim();
    const sonda = document.createElement("span");
    sonda.style.backgroundColor = valor;
    document.body.append(sonda);
    const color = getComputedStyle(sonda).backgroundColor;
    sonda.remove();
    return color;
  }, variable);
}

/** Los canales de un color, sin el alfa (`rgb(98, 131, 255)` → `[98, 131, 255]`). */
function canales(color: string): number[] {
  return (color.match(/[\d.]+/g) ?? []).map(Number).slice(0, 3);
}

/** Las capas de una sombra: el color de cada una y su medida más grande. */
function capasDe(sombra: string): { color: string; medida: number }[] {
  const soloColores = /(?:rgba?|hsla?|oklch|oklab|lab|lch|color)\([^)]*\)/g;

  return sombra.split(/,(?![^(]*\))/).map((capa) => {
    const color = (capa.match(soloColores) ?? [""])[0];
    const largos = (capa.replace(soloColores, "").match(/[\d.]+px/g) ?? []).map(Number.parseFloat);

    return { color, medida: largos.length > 0 ? Math.max(...largos) : 0 };
  });
}

/** Si una capa de la sombra dibuja el color pedido, con alfa y con medida: el anillo se ve. */
function muestraElColor(sombra: string, esperado: number[]): boolean {
  return capasDe(sombra).some(({ color, medida }) => {
    const [rojo, verde, azul, alfa] = (color.match(/[\d.]+/g) ?? []).map(Number);

    return [rojo, verde, azul].join() === esperado.join() && (alfa === undefined || alfa > 0) && medida > 0;
  });
}

/** Si hay un anillo visible: alguna capa con color no transparente y con medida. */
function hayAnillo(sombra: string): boolean {
  return capasDe(sombra).some(({ color, medida }) => {
    const alfa = color.match(/\/\s*([\d.]+)\s*\)/)?.[1] ?? color.match(/,\s*([\d.]+)\s*\)/)?.[1];

    return medida > 0 && color !== "" && (alfa === undefined || Number(alfa) > 0);
  });
}

/** Lo que está enfocado ahora, si es una de las secciones de la barra. */
function enfocadoEnLaBarra(page: Page): Promise<{ nombre: string; sombra: string }> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;

    return {
      nombre: el?.closest("nav") ? el.textContent?.trim() ?? "" : "",
      sombra: el ? getComputedStyle(el).boxShadow : "",
    };
  });
}

/** El anillo de foco que está mostrando un elemento ahora mismo. */
function anilloDe(elemento: Locator): Promise<string> {
  return elemento.evaluate((el) => getComputedStyle(el).boxShadow);
}

/** A 390 px las secciones viven en el cajón: hay que abrirlo para poder recorrerlas. */
async function abrirSiHaceFalta(page: Page): Promise<void> {
  if (!esAngosto(page)) {
    return;
  }

  // Se abre con el teclado: así el primer ítem queda con foco de teclado (`:focus-visible`),
  // que es lo que el anillo de foco del sistema dibuja.
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible();
}

/** Recorre con Tab hasta llegar a la sección pedida y devuelve su elemento. */
async function llegarConTab(page: Page, titulo: string): Promise<Locator> {
  for (let intento = 0; intento < 20; intento += 1) {
    await page.keyboard.press("Tab");

    const enfocado = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return el?.closest("nav") ? el.textContent?.trim() ?? "" : "";
    });

    if (enfocado === titulo) {
      return page.getByRole("navigation", { name: "Secciones" }).getByRole("link", { name: titulo });
    }
  }

  throw new Error(`Con Tab no se llegó a la sección "${titulo}"`);
}

test.describe("la navegación del armazón con teclado", () => {
  test("las secciones se recorren con Tab, en orden y con el anillo de foco del sistema", async ({ page }) => {
    await page.goto("/fundamentos");
    await abrirSiHaceFalta(page);

    const delSistema = canales(await colorDelTema(page, "--ring"));
    const recorridas: string[] = [];

    for (let intento = 0; intento < 20 && recorridas.length < ITEMS.length; intento += 1) {
      // Se mira qué está enfocado antes de seguir: al abrir el cajón el foco ya está en el primero.
      const { nombre, sombra } = await enfocadoEnLaBarra(page);

      if (nombre && !recorridas.includes(nombre)) {
        expect(
          muestraElColor(sombra, delSistema),
          `la sección "${nombre}" tiene que mostrar el anillo del sistema`,
        ).toBe(true);
        recorridas.push(nombre);
      }

      await page.keyboard.press("Tab");
    }

    expect(recorridas).toEqual(ITEMS);
  });

  test("una sección se activa con Enter y cambia la pantalla", async ({ page }) => {
    await page.goto("/clientes");
    await abrirSiHaceFalta(page);

    const estados = await llegarConTab(page, "Estados");
    await expect(estados).toBeFocused();

    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/estados$/);
    await expect(page.locator("header").getByRole("heading", { level: 1 })).toHaveText("Estados");
  });

  test("el botón de menú se recorre con Tab y se activa con Enter y con Espacio", async ({ page }) => {
    test.skip(!esAngosto(page), "el botón de menú es de las pantallas angostas");

    await page.goto("/fundamentos");

    const boton = page.getByRole("button", { name: BOTON });
    const sinFoco = await anilloDe(boton);

    await page.keyboard.press("Tab");
    await expect(boton).toBeFocused();

    // El bloque generado dibuja el anillo al 50% del color de `ring`, así que acá alcanza
    // con comprobar que aparece uno visible: el color exacto lo piden las secciones de arriba.
    // El botón transiciona la sombra, así que se espera a que termine de dibujarla.
    await expect.poll(() => anilloDe(boton), { timeout: 3_000 }).not.toBe(sinFoco);
    const conFoco = await anilloDe(boton);
    expect(hayAnillo(conFoco), "con foco el botón muestra un anillo visible").toBe(true);

    await page.keyboard.press("Enter");
    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeHidden();
    await expect(boton).toBeFocused();

    await page.keyboard.press("Space");
    await expect(page.getByRole("navigation", { name: "Secciones" })).toBeVisible();
  });

  test("al abrir el cajón con el teclado el foco pasa al primer ítem", async ({ page }) => {
    test.skip(!esAngosto(page), "el cajón es de las pantallas angostas");

    await page.goto("/fundamentos");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Enter");

    const primera = page.getByRole("navigation", { name: "Secciones" }).getByRole("link", { name: ITEMS[0] });
    await expect(primera).toBeFocused();
  });
});
