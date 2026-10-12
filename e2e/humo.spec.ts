import { expect, test } from "@playwright/test";

test("la aplicación arranca y muestra el título", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});
