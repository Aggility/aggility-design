import { expect, test } from "@playwright/test";

// A 390 px la barra lateral está oculta hasta tocar el botón de menú: ese comportamiento
// tiene su propia spec (e2e/estructura-390.spec.ts, tarea 3.4).
test.skip(({ viewport }) => (viewport?.width ?? 0) < 800, "el ancho angosto se prueba en estructura-390.spec.ts");

const SECCION = "/fundamentos";

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
    const colorDelSistema = await page.evaluate(() => {
      const delTema = getComputedStyle(document.documentElement).getPropertyValue("--primary-soft").trim();
      const sonda = document.createElement("span");
      sonda.style.backgroundColor = delTema;
      document.body.append(sonda);
      const color = getComputedStyle(sonda).backgroundColor;
      sonda.remove();
      return color;
    });

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
    const logo = page.getByRole("img", { name: "Aggility" });
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
