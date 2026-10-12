import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
    // Lo que genera la CLI de shadcn: no se escribe a mano y no se ajusta para el
    // linter (por ejemplo `use-mobile.ts` llama a setState dentro de un efecto).
    // Decisión de Germán del 12/10/2026: ver la decisión 16 de design.md.
    "src/components/ui/**",
    "src/hooks/**",
  ]),
]);
