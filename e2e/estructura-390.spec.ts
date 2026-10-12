import { expect, test, type Page } from "@playwright/test";

// Este comportamiento es el de las pantallas angostas: en escritorio lo cubre
// e2e/estructura.spec.ts.
test.skip(({ viewport }) => (viewport?.width ?? 0) >= 800, "la barra lateral angosta se prueba a 390 px");

const SECCIONES = "Secciones";
const BOTON = "Menú de secciones";

/** El ancho del documento y si se puede desplazar en horizontal. */
async function medir(page: Page): Promise<{ ancho: number; desplazable: number }> {
  return page.evaluate(() => {
    window.scrollTo(500, 0);
    const desplazable = window.scrollX;
    window.scrollTo(0, 0);

    return { ancho: document.documentElement.scrollWidth, desplazable };
  });
}

async function abrirElCajon(page: Page): Promise<void> {
  await page.getByRole("button", { name: BOTON }).click();
  await expect(page.getByRole("navigation", { name: SECCIONES })).toBeVisible();
}

test.describe("la barra lateral en pantallas angostas", () => {
  test("no hay desplazamiento horizontal, ni en claro ni en oscuro", async ({ page }) => {
    for (const modo of ["claro", "oscuro"]) {
      await page.goto("/fundamentos");
      // El modo se fuerza por clase: el selector del encabezado llega en la tarea 4.3.
      await page.evaluate((elegido) => {
        document.documentElement.classList.toggle("dark", elegido === "oscuro");
      }, modo);

      const { ancho, desplazable } = await medir(page);

      expect(ancho, `en ${modo} el documento no puede pasar de 390 px`).toBeLessThanOrEqual(390);
      expect(desplazable, `en ${modo} la pantalla no se puede desplazar en horizontal`).toBe(0);
    }
  });

  test("la barra no ocupa lugar hasta que se toca el botón de menú", async ({ page }) => {
    await page.goto("/clientes");

    await expect(page.getByRole("button", { name: BOTON })).toBeVisible();
    await expect(page.getByRole("navigation", { name: SECCIONES })).toBeHidden();

    const anchoDelContenido = await page.getByRole("main").evaluate((elemento) => elemento.getBoundingClientRect().width);
    expect(anchoDelContenido, "el contenido usa todo el ancho: la barra no reserva lugar").toBeGreaterThanOrEqual(380);
  });

  test("el cajón se abre, la sección cambia y el cajón se cierra", async ({ page }) => {
    await page.goto("/clientes");

    await abrirElCajon(page);
    await page.getByRole("navigation", { name: SECCIONES }).getByRole("link", { name: "Fundamentos" }).click();

    await expect(page).toHaveURL(/\/fundamentos$/);
    await expect(page.getByRole("navigation", { name: SECCIONES })).toBeHidden();
  });

  test("cerrar sin elegir nada deja la sección como estaba", async ({ page }) => {
    await page.goto("/clientes");

    await abrirElCajon(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: SECCIONES })).toBeHidden();
    await expect(page).toHaveURL(/\/clientes$/);

    await abrirElCajon(page);
    // Un toque fuera del cajón, sobre lo que queda de pantalla a la derecha.
    await page.mouse.click(370, 400);
    await expect(page.getByRole("navigation", { name: SECCIONES })).toBeHidden();
    await expect(page).toHaveURL(/\/clientes$/);
  });

  test("con el cajón cerrado el contenido se lee completo", async ({ page }) => {
    await page.goto("/clientes");

    const contenido = page.getByText("Acá va la lista de clientes");
    await expect(contenido).toBeVisible();

    const caja = (await contenido.boundingBox())!;
    expect(caja.x, "el contenido empieza adentro de la pantalla").toBeGreaterThanOrEqual(0);
    expect(caja.x + caja.width, "el contenido no se sale de la pantalla").toBeLessThanOrEqual(390);
  });
});
