import { defineConfig, devices } from "@playwright/test";

// Puerto propio y poco común: en 3000 y 3100 puede haber otras apps de Aggility corriendo.
const PUERTO = 3202;
const URL_BASE = `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: URL_BASE,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "escritorio", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "angosto", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PUERTO}`,
    url: URL_BASE,
    // NUNCA reutilizar un servidor ajeno. Con `true`, los tests dieron verde contra
    // aggility-gestion, que ya estaba escuchando en el puerto elegido.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
