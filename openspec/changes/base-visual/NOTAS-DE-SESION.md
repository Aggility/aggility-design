# Notas de sesión — base-visual

> **Archivo temporal.** Existe solo para que la próxima sesión retome el cambio sin
> releer el chat. **Borrar antes de archivar `base-visual`:**
> `rm openspec/changes/base-visual/NOTAS-DE-SESION.md`

## Dónde quedó el trabajo (12/10/2026)

- 15 de 42 tareas hechas: el grupo 1 completo (proyecto, estructura, Tailwind, lint,
  Vitest, Playwright y `.gitignore`) y el **grupo 2 completo** (el tema generado desde
  los tokens), en 12 commits.
- En verde, los cinco: `npx tsc --noEmit`, `npm run lint`, `npm test` (16 tests),
  `npx playwright test` y `npm run build`.
- **La próxima tarea es la 3.1 y está FRENADA**: el `init` de la CLI de shadcn trae
  `tw-animate-css`, que `design.md` no nombra. Está todo anotado debajo de la tarea en
  `tasks.md`; falta el OK de Germán. Se retoma con:
  `openspec instructions apply --change "base-visual" --json`
- El tema ya está cableado: `src/app/globals.css` importa la copia del tema y la app
  carga Inter con `next/font` (pesos 400, 500 y 600).

## El generador del tema (grupo 2, ya hecho)

`scripts/generar-tema.mjs`, sin dependencias. `npm run tema` escribe **dos** archivos con
el mismo contenido: `sistema/aggility-theme.css` (el publicado) y `src/app/aggility-theme.css`
(la copia de la app). Estructura del archivo: cabecera con la fecha de `meta.synced`,
`@theme inline` (3 variables de tipografía, las 10 clases `--text-*`, los 42 `--color-*` y
los 4 radios derivados del radio base), `:root` (`--radius` primero, después los 42 colores,
los alias `{foreground}` como `var(--foreground)`) y `.dark` (sólo los que difieren del claro
más `color-scheme: dark`).

Los tests del tema:

- `tests/tema/generador.test.ts` — los 42 colores en cada modo, `chart-1` a `chart-8` y los
  estados `success` y `warning`.
- `tests/tema/estilos-texto.test.ts` — una clase `text-<estilo>` por estilo de la fuente,
  con tamaño, alto de línea, peso e interletrado.
- `tests/tema/radios.test.ts` — los cuatro radios salen del radio base y valen 6, 8, 10 y 14 px.
- `tests/tema/coincidencia.test.ts` — CA-2: los dos archivos son, línea por línea, lo que el
  comando genera.
- `tests/tema/sin-literales.test.ts` — CA-1: ningún literal de color, tamaño de letra ni radio
  en el código de `src/`.

## Trampas conocidas

- **`allowJs: true` en `tsconfig.json`**: sin eso, un test `.ts` no puede importar el generador
  `.mjs` (TS7016).
- **El test de CA-1 excluye los destinos del generador** (los toma de `DESTINOS`). El único
  archivo de `src/` con colores literales por diseño es la copia del tema, y sus valores los
  guarda el test de coincidencia.
- **CA-1 cubre valores literales, no nombres de clases.** Hallazgo para el grupo 5: las clases
  de la escala por defecto de Tailwind (`text-sm`, `text-3xl` —hoy en `src/app/page.tsx`—) no
  salen de la fuente, y la CLI de shadcn las usa en los componentes generados. Hay que decidir
  en la 5.1 si los componentes base se quedan con esa escala o se mapea a los estilos del tema.
  Ojo: los radios de la herramienta (`rounded-md`, `rounded-lg`) sí salen del tema, porque
  Tailwind v4 los toma de `--radius-*`.
- **TypeScript quedó en 6.0.3**, no en 7.0.2: `typescript-eslint`, que trae `eslint-config-next`,
  no soporta TS 7 y corta al cargar.
- El config de Vitest es `vitest.config.mts` (no `.ts`): con `.ts`, Vite avisa que lo carga
  como CommonJS.
- `npm audit` reporta 9 vulnerabilidades altas, todas en el árbol de **desarrollo** del CLI de
  `shadcn` (`fast-glob`/`ts-morph` vía `@shadcn/registry`). Nada de runtime.

## Trampa ya pagada: puertos ocupados por otras apps de Aggility

En 3000 y 3100 puede haber otras apps de Aggility corriendo: hoy `aggility-gestion` tenía
dos servidores levantados. Con `reuseExistingServer: true`, Playwright **reutiliza** ese
servidor y los tests dan verde contra la app equivocada. Ya pasó en la tarea 1.6: los
tests corrieron contra la pantalla `/ingreso` de `aggility-gestion`.

- `playwright.config.ts` usa el puerto **3202** y `reuseExistingServer: false`.
- Todo test que corra contra el servidor tiene que afirmar algo **propio** de esta app
  (texto o `<title>`), para que un puerto ajeno lo haga fallar en lugar de dar verde.
- Vale para las tareas 3.4 (390 px), 3.5, el grupo 4 y la 6.1 (capturas).

## Lo que le falta al grupo 3

- La CLI de shadcn (`shadcn@4.21.4`, preset `base-nova`) puede escribir variables de estilo en
  `globals.css` y en otros archivos: hay que borrarlas y dejar el tema generado, y que
  `npm test` (el test de coincidencia y el de CA-1) siga en verde.
- `globals.css` tiene hoy el `@custom-variant dark (&:is(.dark *))` que el encabezado del tema
  documenta; si la CLI lo agrega de nuevo, hay que dejar una sola declaración.
