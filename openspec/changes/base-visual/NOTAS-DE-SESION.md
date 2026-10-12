# Notas de sesión — base-visual

> **Archivo temporal.** Existe solo para que la próxima sesión retome el cambio sin
> releer el chat. **Borrar antes de archivar `base-visual`:**
> `rm openspec/changes/base-visual/NOTAS-DE-SESION.md`

## Dónde quedó el trabajo (12/10/2026)

- 16 de 42 tareas hechas: el grupo 1 completo (proyecto, estructura, Tailwind, lint,
  Vitest, Playwright y `.gitignore`), el **grupo 2 completo** (el tema generado desde
  los tokens) y la **3.1** (el bloque de barra lateral y los componentes base con la CLI
  oficial de shadcn, con las decisiones de Germán del 12/10/2026 ya aplicadas).
- En verde, los cinco: `npx tsc --noEmit`, `npm run lint`, `npm test` (16 tests),
  `npx playwright test` (2/2) y `npm run build`.
- La próxima tarea es la **3.2** (la barra lateral propia, con su test e2e primero). Se
  retoma con: `openspec instructions apply --change "base-visual" --json`
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

## Lo que hace la CLI del grupo 3 (verificado el 12/10/2026, corriéndola)

- **Necesita `next.config.*`**: si no está, corta con "We could not detect a supported
  framework". Se creó `next.config.ts` vacío.
- `init -d --no-monorepo` **pisa `globals.css`** (agrega su paleta neutra en `@theme inline`,
  `:root` y `.dark`, más un `@layer base` y `html { @apply font-sans }`) y **cambia la
  tipografía de `layout.tsx` por Geist**. Hay que restaurar los dos y dejar sólo sus dos
  `@import` (`tw-animate-css` y `shadcn/tailwind.css`, del paquete ya aprobado) y el
  `@layer base`.
- Pone `tw-animate-css` como dependencia de **runtime y con rango `^`**: va a
  `devDependencies` fijo en `1.4.0`. También convierte `shadcn` de `4.21.4` a `^4.21.4`.
- Instala el paquete npm **`cn`** (no es clsx+tailwind-merge, es un paquete aparte de los
  mismos autores) y el código generado importa de ahí.
- Los componentes generados **no tienen ningún color literal** y sus radios salen del tema,
  pero sí traen valores propios de tamaño de letra y radio (el test de CA-1 los marca) y la
  escala de texto por defecto de la herramienta (`text-sm`, `text-xs`). `use-mobile.ts` trae
  un error de lint. Todo eso está con evidencia en `tasks.md`, bajo la 3.1.
- **Las decisiones ya están tomadas** (Germán, 12/10/2026; ver la decisión 16 de
  `design.md`): el código de la herramienta se toma tal cual, el test de literales y el lint
  lo dejan afuera (`src/components/ui/**` y `src/hooks/**`), y `sistema/guia.md` se ajustó al
  preset en el anillo de foco y en la escala de texto. Si se vuelve a correr la CLI —por
  ejemplo para agregar otro componente— hay que restaurar otra vez `globals.css` y
  `layout.tsx` y correr `npm test` (el test de coincidencia de CA-2 avisa si el tema quedó
  pisado).
