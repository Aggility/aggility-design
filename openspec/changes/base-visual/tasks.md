# Tasks

## 1. Proyecto y herramientas

**Puerta de Germán**: aprobada el 12/10/2026 — las 9 dependencias de runtime de `design.md` (sección "Dependencias de runtime nuevas") quedan aprobadas tal como están, así que no hay que frenar al llegar acá.

- [x] 1.1 Crear `package.json` con las versiones exactas de `design.md` y los scripts `dev`, `build`, `start`, `lint`, `test`, `e2e`, `tema` y `capturas` (los dos últimos quedan apuntando a lo que crean 2.2 y 6.1). Verificación: `npm install` sale 0 y `npm ls --depth=0` muestra las versiones exactas fijadas, sin rangos.
- [x] 1.2 Crear `tsconfig.json` (estricto, alias de rutas), `src/app/layout.tsx` y `src/app/page.tsx` mínimos. Verificación: `npx tsc --noEmit` y `npm run build` en verde. Si TypeScript 7.0.2 falla con Next 16.4.0, fijar 6.0.3 (verificada en `design.md`) y anotar el motivo acá.
- [x] 1.3 Configurar Tailwind v4: `src/app/globals.css` y `postcss.config.mjs`. Verificación: `npm run build` en verde y una clase utilitaria de prueba presente en el CSS compilado.
- [x] 1.4 Configurar lint y formato: `eslint.config.mjs` y `.prettierrc`. Verificación: `npm run lint` termina sin errores ni advertencias.
  - **Nota (12/10/2026):** TypeScript 7.0.2 quedó descartado. `tsc --noEmit` y `next build` funcionan con TS 7, pero `typescript-eslint`, que usa `eslint-config-next`, no lo soporta y falla al cargar (`typescript-eslint does not support TS 7.0.`). Se fijó **6.0.3**, el respaldo que `design.md` preveía; `tsc`, `next build` y `npm run lint` quedan los tres en verde. `design.md` quedó corregido en el mismo commit.
- [x] 1.5 Configurar Vitest: `vitest.config.ts` (quedó como `vitest.config.mts`: con la extensión `.ts` Vite avisa que el archivo se carga como CommonJS) y `tests/humo.test.ts`. Verificación: `npm test` en verde.
- [x] 1.6 Configurar Playwright: `playwright.config.ts` y `e2e/humo.spec.ts`. Verificación: `npx playwright test` en verde.
- [x] 1.7 Agregar `.gitignore` lo que falte para este stack (`/test-results/`, `/playwright-report/`, `coverage/`) y comprobar que `docs/capturas/` NO queda ignorado. Verificación: `git check-ignore -v test-results/` nombra la regla y `git check-ignore -v docs/capturas/` no devuelve nada.

## 2. Tema generado desde los tokens

Cubre la capacidad `tema` (CA-1, CA-2, reglas 2 y 3).

- [ ] 2.1 Escribir primero `tests/tema/generador.test.ts` (en rojo): el tema generado desde `sistema/tokens.json` tiene los 42 colores con su valor en cada modo, los colores de gráfico 1 a 8 y los estados bueno y atención. Archivos: `tests/tema/generador.test.ts`. Verificación: `npm test` falla nombrando lo que falta.
- [ ] 2.2 Implementar el generador `scripts/generar-tema.mjs` (sin dependencias) y el script `tema` de `package.json`. Verificación: `npm run tema` sale 0, `git diff --exit-code sistema/aggility-theme.css` no muestra cambios (el tema publicado ya coincide con lo que se genera) y el test de 2.1 pasa.
- [ ] 2.3 Emitir los estilos de texto: escribir primero `tests/tema/estilos-texto.test.ts` (tamaño, alto de línea, peso e interletrado de cada estilo) y después extender el generador. Archivos: `tests/tema/estilos-texto.test.ts`, `scripts/generar-tema.mjs`, `sistema/aggility-theme.css`. Verificación: `npm test` en verde y `python3 -c` sobre el archivo muestra una clase por estilo de la fuente.
- [ ] 2.4 Emitir los radios derivados del radio base: escribir primero el test que comprueba que los cuatro radios del tema equivalen a los cuatro de la fuente (6, 8, 10 y 14 px) y después extender el generador. Verificación: `npm test` en verde; cambiar la proporción de un radio pone el test en rojo (se prueba y se revierte).
- [ ] 2.5 Escribir el test de CA-2 (`tests/tema/coincidencia.test.ts`): el tema generado en memoria coincide con `sistema/aggility-theme.css` y con la copia de la app; crear `src/app/aggility-theme.css` con el generador. Verificación: `npm test` en verde; cambiar a mano un color de la copia pone el test en rojo nombrando el archivo (se prueba y se revierte).
- [ ] 2.6 Cablear el tema en la app: importar la copia en `src/app/globals.css` después de Tailwind, borrar los bloques de variables por defecto, y cargar Inter con `next/font` como familia única en `src/app/layout.tsx`. Verificación: `npm run build` en verde y `npx playwright test e2e/humo.spec.ts` pasa.
- [ ] 2.7 Escribir el test de CA-1 (`tests/tema/sin-literales.test.ts`): recorre `src/` y falla ante un color (hexadecimal, rgb, hsl, oklch), un tamaño de letra o un radio literal, nombrando archivo y línea. Verificación: `npm test` en verde; agregar `#ff0000` a un componente lo pone en rojo (se prueba y se revierte).
- [ ] 2.8 Actualizar el README: "Cómo se usa en una app" pasa a explicar el comando de generación del tema (el tema no se edita ni se copia a mano) y a nombrar la copia que consume la app. Verificación: los pasos del README, ejecutados al pie de la letra, dejan el proyecto funcionando (`npm run tema`, `npm run build`).

## 3. Armazón de la aplicación

Cubre la capacidad `estructura-app` (CA-4, CA-8, sección 5.3).

- [ ] 3.1 Generar el bloque de barra lateral con la CLI oficial (`shadcn@4.21.4`, preset `base-nova`), junto con `components.json` y la utilidad de composición de clases. Archivos: `components.json`, `src/components/ui/*`, `src/lib/utils.ts`. Verificación: `npx tsc --noEmit`, `npm run lint` y `npm test` (incluye el test de CA-1) en verde; si la CLI escribe variables de estilo, se borran y vuelve a quedar el tema generado (test de 2.5 en verde).
- [ ] 3.2 Escribir primero `e2e/estructura.spec.ts` (la sección actual se ve destacada, los grupos se distinguen, cada ítem tiene ícono, el logo está arriba y el menú del usuario abajo) y después la barra lateral. Archivos: `e2e/estructura.spec.ts`, `src/components/estructura/barra-lateral.tsx`, `src/components/estructura/secciones.ts`. Verificación: `npx playwright test e2e/estructura.spec.ts` en verde.
- [ ] 3.3 Escribir primero los casos del encabezado (título de la sección una sola vez por vista; sin acción principal no hay botón ni espacio reservado) y después el encabezado. Archivos: `e2e/estructura.spec.ts`, `src/components/estructura/encabezado.tsx`. Verificación: `npx playwright test e2e/estructura.spec.ts` en verde.
- [ ] 3.4 Escribir primero `e2e/estructura-390.spec.ts` (CA-4: sin desplazamiento horizontal a 390 px en los dos modos, barra oculta hasta el botón de menú, cajón que se abre y se cierra al elegir o tocar fuera) y después el comportamiento angosto. Archivos: `e2e/estructura-390.spec.ts`, `src/components/estructura/barra-lateral.tsx`. Verificación: `npx playwright test e2e/estructura-390.spec.ts` en verde; medir el ancho del documento con Playwright da 390 px o menos, sin desplazamiento lateral.
- [ ] 3.5 Escribir primero `e2e/teclado-armazon.spec.ts` (CA-8: los ítems y el botón de menú se recorren con Tab, se activan con Enter y Espacio, muestran el anillo de foco, y al abrir el cajón el foco pasa al primer ítem). Verificación: `npx playwright test e2e/teclado-armazon.spec.ts` en verde; quitar el anillo de un ítem pone el test en rojo (se prueba y se revierte).

## 4. Modo claro y oscuro

Cubre el requisito de modo de la capacidad `tema` (CA-3) y el selector del encabezado.

- [ ] 4.1 Escribir primero `e2e/modo.spec.ts` (en rojo): sin elección guardada y sistema en oscuro la app se ve en oscura; elegir claro y recargar deja claro; con elección guardada un cambio del sistema no pisa la elección. Verificación: `npx playwright test e2e/modo.spec.ts` falla.
- [ ] 4.2 Implementar el proveedor de modo (clase en el elemento raíz, modo inicial "sistema", sin transición al cambiar) en `src/components/tema/proveedor-de-modo.tsx` y usarlo en `src/app/layout.tsx`. Verificación: `npx playwright test e2e/modo.spec.ts` en verde.
- [ ] 4.3 Agregar el selector de modo al encabezado (claro, oscuro y sistema), con etiqueta accesible y operable con teclado. Archivos: `src/components/estructura/encabezado.tsx`, `src/components/tema/selector-de-modo.tsx`. Verificación: `npx playwright test e2e/modo.spec.ts e2e/teclado-armazon.spec.ts` en verde.
- [ ] 4.4 Escribir primero el caso del primer pintado (con elección guardada de oscuro, el primer pintado ya es oscuro y no se ve un destello claro) y ajustar el proveedor para que lo cumpla. Archivos: `e2e/modo.spec.ts`, `src/components/tema/proveedor-de-modo.tsx`. Verificación: `npx playwright test e2e/modo.spec.ts` en verde.

## 5. Componentes base

Cubre la capacidad `componentes-base` (CA-8, sección 5.4).

- [ ] 5.1 Generar con la CLI oficial los 14 componentes de la sección 5.4: botón, campo, selector, casilla, diálogo, cajón, menú desplegable, tabla, insignia, tarjeta, separador, tooltip, avatar y aviso. Archivos: `src/components/ui/*`. Verificación: `npx tsc --noEmit`, `npm run lint` y `npm test` (incluye CA-1) en verde. Si un componente falta en el registro, anotar el bloqueo acá y frenar; no se escribe a mano.
- [ ] 5.2 Escribir `tests/componentes/inventario.test.tsx`: los 14 componentes existen, renderizan sin errores y no traen literales de color, tamaño de letra ni radio. Verificación: `npm test` en verde y una lista de 14 nombres en la salida del test.
- [ ] 5.3 Escribir `tests/componentes/teclado.test.tsx` (CA-8): cada control recibe foco con Tab, se activa con Enter o Espacio, el diálogo, el cajón, el menú y el tooltip se cierran con Escape devolviendo el foco, las flechas recorren el menú y el selector, y todos muestran el anillo de foco. Verificación: `npm test` en verde; sacar el anillo de un componente pone el test en rojo (se prueba y se revierte).
- [ ] 5.4 Escribir `tests/componentes/estados.test.tsx`: los avisos dicen qué pasó y cómo seguir sin disculpas ni signos de exclamación, cada insignia de estado lleva palabra o ícono, y una acción que borra se anuncia con el estado de error. Verificación: `npm test` en verde y quitar la palabra de una insignia pone el test en rojo (se prueba y se revierte).

## 6. Capturas

Cubre la capacidad `capturas` (CA-10).

- [ ] 6.1 Implementar `scripts/capturas.mjs`: recorre las secciones del armazón (no una lista escrita a mano), fuerza el modo y el ancho, espera a que la tipografía esté lista y guarda una captura por pantalla, modo y ancho en `docs/capturas/` con el nombre `<pantalla>-<claro|oscuro>-<1280|390>.png`. Verificación: `npm run capturas` deja la cantidad esperada de archivos (pantallas × 2 modos × 2 anchos) y los nombres siguen el formato.
- [ ] 6.2 Escribir `tests/capturas/capturas.test.ts` (CA-10): falla si falta una captura de una pantalla, un modo o un ancho, o si alguna quedó vacía, y la nombra. Verificación: `npm test` en verde; borrar una captura pone el test en rojo (se restaura).
- [ ] 6.3 Comprobar que dos corridas seguidas no cambian nada cuando nada visible cambió. Verificación: `npm run capturas` dos veces y `git diff --exit-code docs/capturas` sin cambios.
- [ ] 6.4 Commitear el juego de capturas y comprobar que se versiona. Verificación: `git status --short docs/capturas` muestra los archivos (no ignorados) y `git ls-files docs/capturas | wc -l` coincide con la cantidad esperada.

## 7. Pantalla de fundamentos

Cubre la capacidad `pantalla-fundamentos` (sección 5.2, guía visual).

- [ ] 7.1 Escribir primero `e2e/fundamentos.spec.ts` (cada color con nombre, valor y uso; los valores siguen al modo activo) y después la tabla de colores. Archivos: `e2e/fundamentos.spec.ts`, `src/app/fundamentos/page.tsx`, `src/components/fundamentos/tabla-de-colores.tsx`. Verificación: `npx playwright test e2e/fundamentos.spec.ts` en verde y `npm run capturas` con las capturas nuevas de la pantalla revisadas.
- [ ] 7.2 Mostrar los estilos de texto con nombre, tamaño, alto de línea, peso y uso, aplicados sobre texto real, todos con la misma familia. Archivos: `src/components/fundamentos/estilos-de-texto.tsx`, `e2e/fundamentos.spec.ts`. Verificación: `npx playwright test e2e/fundamentos.spec.ts` en verde y `npm run capturas`.
- [ ] 7.3 Mostrar la escala de espacio y los radios con su nombre, su medida y un ejemplo visible. Archivos: `src/components/fundamentos/espacio-y-radios.tsx`, `e2e/fundamentos.spec.ts`. Verificación: `npx playwright test e2e/fundamentos.spec.ts` en verde y `npm run capturas`.
- [ ] 7.4 Mostrar las series de gráfico en orden y los estados siempre con palabra, signo o ícono, sin usar el color de un estado como color de serie. Archivos: `src/components/fundamentos/series-y-estados.tsx`, `tests/componentes/estados.test.tsx`. Verificación: `npm test` y `npx playwright test e2e/fundamentos.spec.ts` en verde, y `npm run capturas`.
- [ ] 7.5 Mostrar los logos con su regla de uso (cuál va sobre fondo claro, cuál sobre oscuro y el isotipo en espacio cuadrado), como imágenes, sin recolorear ni redibujar. Archivos: `src/components/fundamentos/logos.tsx`, `e2e/fundamentos.spec.ts`. Verificación: `npx playwright test e2e/fundamentos.spec.ts` en verde y `npm run capturas`.
- [ ] 7.6 Escribir el test de coincidencia con la fuente (`tests/fundamentos/coincidencia.test.ts`): lo que la pantalla muestra coincide con los valores de `sistema/tokens.json`. Verificación: `npm test` en verde; cambiar un valor en la fuente, correr `npm run tema` y ver el valor nuevo en la pantalla; después revertir el cambio de la fuente y dejar el test en verde (anotar el resultado en `verificacion.md`).

## 8. Cierre

- [ ] 8.1 Completar en `AGENTS.md` la sección "Estructura y comandos del proyecto" con la estructura real de carpetas y los comandos que existen. Verificación: cada comando listado existe en `package.json` y se ejecuta.
- [ ] 8.2 Escribir `verificacion.md` en la carpeta del cambio: una fila por requisito de las 5 capacidades con su test y su resultado, más la lista de capturas a revisar. Verificación: cada fila nombra un test que existe y su resultado coincide con lo que devuelve correrlo.
- [ ] 8.3 Agregar al final de `tasks.md` la tabla de trazabilidad requisito → tareas y comprobar que ninguna fila queda vacía. Verificación: `openspec validate "base-visual" --strict` sin hallazgos y cada requisito de las 5 specs aparece en la tabla.
- [ ] 8.4 Correr la verificación completa: `npx tsc --noEmit`, `npm run lint`, `npm test`, `npx playwright test` y `openspec validate "base-visual" --strict`. Verificación: los cinco comandos terminan en verde.

## Workflow follow-up

- **Puerta de Germán**: revisar el diff y las capturas de `docs/capturas/` y aprobar antes de archivar.
- Archivar el cambio recién cuando Germán aprueba.
- Al cerrar, un modelo más fuerte, en otra sesión, revisa `verificacion.md` y las capturas contra la spec.
- Borrar `openspec/changes/base-visual/NOTAS-DE-SESION.md` (notas temporales de la sesión del 12/10/2026) antes de archivar el cambio.
- Commit por tarea, con el número de la tarea en el mensaje. Nunca push ni deploy sin que Germán lo pida.

## Trazabilidad requisito → tareas

| Capacidad | Requisito | CA / regla | Tareas |
|---|---|---|---|
| `tema` | Tema generado por un comando | CA-2, regla 3 | 2.1, 2.2, 2.5 |
| `tema` | Un cambio de la fuente llega al tema | CA-2, regla 3 | 2.2, 2.3, 2.4 |
| `tema` | Cobertura del tema | regla 2 | 2.2, 2.3, 2.4, 5.1 |
| `tema` | Ningún valor visual literal | CA-1, regla 2 | 2.7 |
| `tema` | Modo claro y oscuro | CA-3 | 4.1, 4.2, 4.3, 4.4 |
| `tema` | Tema copiable a otra aplicación | CA-2, regla 3 | 2.5, 2.6, 2.8 |
| `tema` | Una sola tipografía | regla 2 | 2.6, 7.2 |
| `estructura-app` | Barra lateral con secciones agrupadas | sección 5.3 | 3.1, 3.2 |
| `estructura-app` | Encabezado de sección | sección 5.3 | 3.3, 4.3 |
| `estructura-app` | Barra lateral como cajón en pantallas angostas | CA-4 | 3.4 |
| `estructura-app` | Navegación con teclado | CA-8 | 3.5 |
| `componentes-base` | Inventario de componentes base | sección 5.4 | 5.1, 5.2 |
| `componentes-base` | Apariencia según el tema | CA-1, regla 2 | 2.7, 5.1, 5.2 |
| `componentes-base` | Operación con teclado | CA-8 | 5.3 |
| `componentes-base` | Los estados no se comunican solo por color | regla 5, guía visual | 5.4, 7.4 |
| `pantalla-fundamentos` | Colores con nombre y valor | sección 5.2 | 7.1 |
| `pantalla-fundamentos` | Estilos de texto | sección 5.2 | 7.2 |
| `pantalla-fundamentos` | Escala de espacio y radios | sección 5.2, regla 2 | 7.3 |
| `pantalla-fundamentos` | Colores de gráficos y estados | guía visual, CA-6 (cambio 2) | 7.4 |
| `pantalla-fundamentos` | Logos con su regla de uso | guía visual, sección 5.2 | 7.5 |
| `pantalla-fundamentos` | Lo que se muestra sale de la fuente | CA-2, regla 2 | 7.6 |
| `capturas` | Comando de capturas | CA-10 | 6.1 |
| `capturas` | Nombres predecibles | CA-10 | 6.1, 6.3 |
| `capturas` | Las capturas se versionan | CA-10 | 6.4 |
| `capturas` | Una captura faltante o vacía rompe la verificación | CA-10 | 6.2 |
