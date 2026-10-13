import { expect, test, type Page } from "@playwright/test";

// A 390 px la barra lateral está oculta hasta tocar el botón de menú: ese comportamiento
// tiene su propia spec (e2e/estructura-390.spec.ts, tarea 3.4).
test.skip(({ viewport }) => (viewport?.width ?? 0) < 800, "el ancho angosto se prueba en estructura-390.spec.ts");

const SECCION = "/fundamentos";

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

test.describe("la barra lateral", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SECCION);
  });

  test("destaca la sección actual con los colores del sistema y deja las demás sin destacar", async ({ page }) => {
    const actual = page.getByRole("link", { name: "Fundamentos" });
    const ajena = page.getByRole("link", { name: "Clientes" });

    await expect(actual).toHaveAttribute("aria-current", "page");
    await expect(ajena).not.toHaveAttribute("aria-current", "page");

    // El color lo dice el tema, no un valor escrito en el test.
    const colorDelSistema = await colorDelTema(page, "--primary-soft");

    await expect(actual).toHaveCSS("background-color", colorDelSistema);
    expect(await ajena.evaluate((elemento) => getComputedStyle(elemento).backgroundColor)).not.toBe(colorDelSistema);
  });

  test("muestra los grupos separados y cada uno con su título", async ({ page }) => {
    const delSistema = page.getByRole("group", { name: "Sistema de diseño" });
    const deMuestra = page.getByRole("group", { name: "Pantallas de muestra" });

    await expect(delSistema).toBeVisible();
    await expect(deMuestra).toBeVisible();

    const cajaDelSistema = await delSistema.boundingBox();
    const cajaDeMuestra = await deMuestra.boundingBox();

    expect(cajaDelSistema, "el grupo Sistema de diseño tiene que ocupar un lugar en la pantalla").not.toBeNull();
    expect(cajaDeMuestra, "el grupo Pantallas de muestra tiene que ocupar un lugar en la pantalla").not.toBeNull();
    expect(cajaDeMuestra!.y).toBeGreaterThan(cajaDelSistema!.y + cajaDelSistema!.height - 1);
  });

  test("cada ítem lleva su ícono, y ninguno es un emoji", async ({ page }) => {
    const items = page.getByRole("navigation", { name: "Secciones" }).getByRole("link");

    await expect(items).toHaveCount(6);

    for (const item of await items.all()) {
      await expect(item.locator("svg"), "cada ítem tiene exactamente un ícono").toHaveCount(1);
      expect(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(await item.innerText())).toBe(false);
    }
  });

  test("el logo queda arriba y el menú del usuario abajo", async ({ page }) => {
    // Exacto: en la pantalla de fundamentos también hay logos, con nombres accesibles que contienen
    // "Aggility" (los describe la guía). Este es el de la barra lateral, que se llama así y nada más.
    const logo = page.getByRole("img", { name: "Aggility", exact: true });
    const usuario = page.getByRole("button", { name: "Menú de Camila Duarte" });
    const ultimoItem = page.getByRole("link", { name: "Estados" });

    await expect(logo).toBeVisible();
    const cajaLogo = await logo.boundingBox();
    const cajaUsuario = await usuario.boundingBox();
    const cajaUltimoItem = await ultimoItem.boundingBox();

    expect(cajaLogo, "el logo tiene que verse").not.toBeNull();
    expect(cajaUsuario, "el menú del usuario tiene que verse").not.toBeNull();
    expect(cajaUltimoItem, "el último ítem tiene que verse").not.toBeNull();

    expect(cajaLogo!.y).toBeLessThan(cajaUltimoItem!.y);
    expect(cajaUsuario!.y).toBeGreaterThan(cajaUltimoItem!.y);
    await expect(usuario).toContainText("Camila Duarte");
  });
});

test.describe("el encabezado de sección", () => {
  test("muestra el título de la sección actual y una sola vez en la pantalla", async ({ page }) => {
    await page.goto(SECCION);

    await expect(page.locator("header").getByRole("heading", { level: 1 })).toHaveText("Fundamentos");
    await expect(page.getByRole("main").getByText("Fundamentos", { exact: true })).toHaveCount(1);
    await expect(page.getByRole("main").getByText("Inicio", { exact: true })).toHaveCount(0);
  });

  test("sigue a la sección cuando la persona cambia de pantalla", async ({ page }) => {
    await page.goto(SECCION);

    await page.getByRole("link", { name: "Clientes" }).click();

    await expect(page).toHaveURL(/\/clientes$/);
    await expect(page.locator("header").getByRole("heading", { level: 1 })).toHaveText("Clientes");
  });

  test("sin acción principal no muestra ningún botón y no deja el espacio reservado", async ({ page }) => {
    await page.goto(SECCION);

    const encabezado = page.locator("header");
    await expect(encabezado.getByRole("link")).toHaveCount(0);
    const altoSinAccion = (await encabezado.boundingBox())!.height;

    await page.goto("/clientes");
    const altoConAccion = (await encabezado.boundingBox())!.height;

    expect(
      Math.abs(altoConAccion - altoSinAccion),
      "el encabezado mide lo mismo con acción y sin acción: no hay un espacio reservado",
    ).toBeLessThanOrEqual(1);
  });

  test("con acción principal muestra una sola, y con los colores del sistema", async ({ page }) => {
    await page.goto("/clientes");

    const accion = page.locator("header").getByRole("link", { name: "Nuevo cliente" });
    await expect(accion).toBeVisible();

    const primario = await colorDelTema(page, "--primary");
    await expect(accion).toHaveCSS("background-color", primario);

    const principales = await page
      .locator("a, button")
      .evaluateAll((elementos, color) => elementos.filter((el) => getComputedStyle(el).backgroundColor === color).length, primario);

    expect(principales, "la acción del encabezado es la única con el color primario").toBe(1);
  });
});
