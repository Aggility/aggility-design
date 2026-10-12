import { expect, test, type Page } from "@playwright/test";

/** La clave con la que se guarda la elección de modo en el dispositivo. */
const CLAVE = "theme";

/** El fondo que está pintando la app ahora mismo. */
function fondoDeLaApp(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.body).backgroundColor);
}

/** El esquema que la app le declara al navegador (`color-scheme`). */
function esquemaDeLaApp(page: Page): Promise<string> {
  return page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
}

/** Deja una elección guardada antes de que la app arranque, como si ya se hubiera elegido. */
async function conEleccionGuardada(page: Page, eleccion: string): Promise<void> {
  await page.addInitScript(
    ([clave, valor]) => window.localStorage.setItem(clave!, valor!),
    [CLAVE, eleccion],
  );
}

const estaEnOscuro = (page: Page): Promise<boolean> =>
  page.evaluate(() => document.documentElement.classList.contains("dark"));

test.describe("el modo claro y oscuro", () => {
  test("sin elección guardada sigue al sistema, en los dos sentidos", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/");

    expect(await estaEnOscuro(page)).toBe(true);
    expect(await esquemaDeLaApp(page)).toBe("dark");
    const deNoche = await fondoDeLaApp(page);

    await page.emulateMedia({ colorScheme: "light" });
    await expect.poll(() => estaEnOscuro(page)).toBe(false);

    expect(await esquemaDeLaApp(page)).toBe("light");
    expect(await fondoDeLaApp(page), "el fondo cambia con el modo").not.toBe(deNoche);
  });

  test("la elección se recuerda y le gana al sistema", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await conEleccionGuardada(page, "light");

    await page.goto("/");
    expect(await estaEnOscuro(page)).toBe(false);

    await page.reload();
    expect(await estaEnOscuro(page), "después de recargar sigue en la elección").toBe(false);
  });

  test("la elección no se pisa cuando el sistema cambia de modo", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await conEleccionGuardada(page, "dark");

    await page.goto("/");
    expect(await estaEnOscuro(page)).toBe(true);

    await page.emulateMedia({ colorScheme: "light" });
    await page.emulateMedia({ colorScheme: "dark" });
    await page.emulateMedia({ colorScheme: "light" });

    expect(await estaEnOscuro(page), "el sistema cambió y la elección sigue").toBe(true);
  });

  test("el selector del encabezado aplica el modo elegido y lo recuerda", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/");

    const selector = page.getByRole("button", { name: "Modo de color" });
    await selector.focus();
    await page.keyboard.press("Enter");

    const elegido = page.getByRole("menuitemradio", { name: "Oscuro" });
    await expect(elegido).toBeVisible();

    // Se recorre el menú con las flechas hasta la opción y se elige con Enter.
    for (let intento = 0; intento < 4; intento += 1) {
      const enfocado = await page.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
      if (enfocado === "Oscuro") break;
      await page.keyboard.press("ArrowDown");
    }
    await expect(elegido).toBeFocused();
    await page.keyboard.press("Enter");

    await expect.poll(() => estaEnOscuro(page)).toBe(true);

    // El modo elegido queda marcado en el menú.
    await selector.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitemradio", { name: "Oscuro" })).toBeChecked();
    await page.keyboard.press("Escape");

    await page.reload();
    expect(await estaEnOscuro(page), "la elección se recuerda").toBe(true);
  });

  test("el primer pintado ya es del modo elegido, sin destello", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await conEleccionGuardada(page, "dark");

    // Se anota el momento en que el modo queda puesto. Después se compara con el primer
    // pintado: si el modo se aplicara recién con el componente montado, quedaría después.
    await page.addInitScript(() => {
      const registro = { cuandoSeAplico: null as number | null };

      (window as unknown as { modoAplicado: typeof registro }).modoAplicado = registro;

      const anotar = () => {
        const raiz = document.documentElement;

        if (raiz && raiz.classList.contains("dark") && registro.cuandoSeAplico === null) {
          registro.cuandoSeAplico = performance.now();
        }
      };

      anotar();
      // El documento se observa entero: al arrancar todavía no existe el elemento raíz.
      new MutationObserver(anotar).observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    });

    await page.goto("/", { waitUntil: "load" });

    const { cuandoSeAplico, primerPintado } = await page.evaluate(() => {
      const registro = (window as unknown as { modoAplicado: { cuandoSeAplico: number | null } }).modoAplicado;

      return {
        cuandoSeAplico: registro.cuandoSeAplico,
        primerPintado: performance.getEntriesByType("paint").find((entrada) => entrada.name === "first-paint")?.startTime ?? null,
      };
    });

    expect(await estaEnOscuro(page), "la app queda en el modo elegido").toBe(true);
    expect(cuandoSeAplico, "el modo se aplicó de verdad").not.toBeNull();
    expect(primerPintado, "hubo un primer pintado").not.toBeNull();
    expect(
      cuandoSeAplico!,
      "el modo se aplica antes del primer pintado: no hay destello del otro modo",
    ).toBeLessThanOrEqual(primerPintado!);
  });
});
