# Notas de sesión — base-visual

> **Archivo temporal.** Existe solo para que la próxima sesión retome el cambio sin
> releer el chat. **Borrar antes de archivar `base-visual`:**
> `rm openspec/changes/base-visual/NOTAS-DE-SESION.md`

## Dónde quedó el trabajo (12/10/2026)

- 32 de 42 tareas hechas: el grupo 1 completo, el **grupo 2 completo** (el tema generado),
  el **grupo 3 completo** (el armazón), el **grupo 4 completo** (el modo claro y oscuro), el
  **grupo 5 completo** (los 14 componentes base, su inventario, su teclado y los estados) y el
  **grupo 6 completo** (el script de capturas, su test y las 24 capturas versionadas).
- En verde, los cinco: `npx tsc --noEmit`, `npm run lint`, `npm test` (30 tests, 10 archivos),
  `npx playwright test` (34 pasan) y `npm run build`.
- La próxima tarea es la **7.1** (la pantalla de fundamentos: primero el test en rojo y después
  la tabla de colores con nombre, valor y uso, que sigue al modo activo). Se retoma con:
  `openspec instructions apply --change "base-visual" --json`

## Lo que ya está armado

- **El tema**: `npm run tema` escribe `sistema/aggility-theme.css` y la copia de la app;
  `src/app/globals.css` la importa y la app carga Inter con `next/font`.
- **Los componentes base**: los 16 que generó la CLI en `src/components/ui/`: los 14 de la
  sección 5.4 (botón, campo, selector, casilla, diálogo, cajón, menú desplegable, tabla,
  insignia, tarjeta, separador, tooltip, avatar y aviso) más el esqueleto y la barra lateral.
- **El armazón**: `src/components/estructura/secciones.ts` (grupos, secciones y el usuario de
  ejemplo) y `barra-lateral.tsx`. El layout arma `SidebarProvider` + la barra + `SidebarInset`
  (que es el `main`: las páginas no llevan otro).
- **Las rutas**: `/` (Inicio), `/fundamentos`, `/clientes`, `/clientes/nuevo`, `/ingreso` y
  `/estados`. Las cinco últimas son pantallas con un párrafo: cada una llega en su cambio
  (Fundamentos en el grupo 7, las de muestra en `pantallas-muestra`).

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
- **CA-1 cubre valores literales, no nombres de clases.** Las clases de la escala por defecto
  de Tailwind (`text-sm`, `text-3xl` —hoy en `src/app/page.tsx`—) no salen de la fuente. Quedó
  resuelto el 12/10/2026 con la decisión 16: los componentes base se quedan con la escala que
  trae la herramienta y `sistema/guia.md` se ajustó a eso.
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

## Trampas nuevas (13/10/2026)

- **El menú del preset no se cierra al elegir** (ni con Enter ni con clic) y el foco se va a
  un `div`. Se arregló en `src/components/tema/selector-de-modo.tsx` (menú controlado: se
  cierra y devuelve el foco al botón). El código de `src/components/ui/` no se toca.
- **Los tooltips del preset necesitan `TooltipProvider`** en el árbol: sin él no abren. Está
  en `src/app/layout.tsx`.
- **Base UI no le pone `role="tooltip"`** al globo: en los tests se lo busca por
  `[data-slot="tooltip-content"]`.
- **jsdom no sirve para el menú ni para el tooltip** (no mueve el foco adentro del popup y
  los disparadores miden cero): esas dos cosas se verifican en `e2e/teclado-armazon.spec.ts`.
- **Testing Library no limpia sola** sin los globales de Vitest: hay que llamar a `cleanup`
  en un `afterEach`, o los renders se acumulan y los `getByRole` encuentran elementos de más.
- Al commitear, **no usar `git add -A`**: Germán tiene cambios propios sin commitear en
  `docs/referencia/spec-producto.md`. Los archivos se agregan por nombre.
- Si Playwright no arranca por "Another next dev server is already running", hay que matar
  **sólo** el `next-server` que quedó colgado en el puerto 3299 (`lsof -nP -iTCP:3299`), no
  todos los de la máquina.
