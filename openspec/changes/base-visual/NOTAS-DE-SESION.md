# Notas de sesión — base-visual

> **Archivo temporal.** Existe solo para que la próxima sesión retome el cambio sin
> releer el chat. **Borrar antes de archivar `base-visual`:**
> `rm openspec/changes/base-visual/NOTAS-DE-SESION.md`

## Dónde quedó el trabajo (12/10/2026)

- 7 de 42 tareas hechas: el grupo 1 completo (proyecto, estructura, Tailwind, lint,
  Vitest, Playwright y `.gitignore`), en 4 commits.
- En verde, los cuatro: `npx tsc --noEmit`, `npm run lint`, `npm test` y `npx playwright test`.
- La próxima tarea es la **2.1**. Se retoma con:
  `openspec instructions apply --change "base-visual" --json`
- El grupo 2 es el generador del tema: la parte delicada del cambio.

## Trampas conocidas del grupo 2 (el generador del tema)

La tarea 2.2 se verifica con `git diff --exit-code sistema/aggility-theme.css`: el
generador tiene que reproducir el archivo actual **byte a byte**. Su estructura, ya mapeada:

- **Cabecera:** seis líneas de comentario. La fecha sale de `meta.synced` de
  `tokens.json`, formateada como `dd/mm/aaaa` (`2026-10-12` → `12/10/2026`).
- **`@theme inline`:** las 3 variables de tipografía (`--font-sans`, `--font-mono`,
  `--font-heading`), después los 42 `--color-<token>: var(--<token>);` en el orden de
  `color.tokens`, y al final los 4 radios.
- **`:root`:** `--radius: 0.625rem;` primero, después los colores en el orden de la
  fuente. Los alias (`{foreground}`) se emiten como `var(--foreground)`.
- **`.dark`:** solo los tokens cuyo valor oscuro **difiere** del claro, en el orden de la
  fuente, y `color-scheme: dark;` al final.
- **Radios:** `--radius` sale de `radius-lg`; sm, md y xl por proporción 0,6 / 0,8 / 1,4,
  que dan los 6, 8 y 14 px de la fuente.
- Para que un test `.ts` pueda importar `scripts/generar-tema.mjs` hace falta
  `allowJs: true` en `tsconfig.json`; si no, TypeScript no encuentra declaraciones de tipos.
- El generador escribe **dos** archivos (el canónico de `sistema/` y la copia que consume
  la app). La copia se crea en la tarea 2.5, no en la 2.2.

## Otras cosas verificadas que no están en los artefactos

- TypeScript quedó en **6.0.3**, no en 7.0.2: `typescript-eslint`, que trae
  `eslint-config-next`, no soporta TS 7 y corta al cargar. Está anotado en `design.md` y
  debajo de la tarea 1.4.
- El config de Vitest es `vitest.config.mts` (no `.ts`): con `.ts`, Vite avisa que lo
  carga como CommonJS.
- `npm audit` reporta 9 vulnerabilidades altas, todas en el árbol de **desarrollo** del
  CLI de `shadcn` (`fast-glob`/`ts-morph` vía `@shadcn/registry`). Nada de runtime.

## Trampa ya pagada: puertos ocupados por otras apps de Aggility

En 3000 y 3100 puede haber otras apps de Aggility corriendo: hoy `aggility-gestion` tenía
dos servidores levantados. Con `reuseExistingServer: true`, Playwright **reutiliza** ese
servidor y los tests dan verde contra la app equivocada. Ya pasó en la tarea 1.6: los
tests corrieron contra la pantalla `/ingreso` de `aggility-gestion`.

- `playwright.config.ts` usa el puerto **3202** y `reuseExistingServer: false`.
- Todo test que corra contra el servidor tiene que afirmar algo **propio** de esta app
  (texto o `<title>`), para que un puerto ajeno lo haga fallar en lugar de dar verde.
- Vale para las tareas 3.4 (390 px), 3.5, el grupo 4 y la 6.1 (capturas).
