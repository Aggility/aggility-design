import { expect, test } from "@playwright/test";

test("la aplicación arranca y muestra su propio título", async ({ page }) => {
  await page.goto("/");
  // Las tres comprobaciones son de esta app: si el puerto lo contestara otra
  // aplicación de Aggility, el test falla en lugar de dar un verde falso.
  await expect(page).not.toHaveURL(/ingreso/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Sistema de diseño de Aggility" }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/sistema de diseño/i);
});
