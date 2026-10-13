# Verificación — base-visual

Una fila por requisito de las cinco capacidades del cambio, con el test que lo cubre y el resultado
de correrlo. Todo lo de abajo se corrió el **13/10/2026**, sobre el commit que cierra la tarea 7.6.

## Cómo se corre

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | verde |
| `npm run lint` | verde |
| `npm test` | **39 tests en 12 archivos**, verde |
| `npx playwright test` | **64 pasan**, 16 saltados a propósito (los casos que sólo valen en un ancho u otro), verde |
| `openspec validate "base-visual" --strict` | `Change 'base-visual' is valid` |

Ojo con el cuarto: en la carpeta hay un `next dev` de Germán levantado en el 3000, y un `next dev`
bloquea a otro en la misma carpeta sin importar el puerto, así que la suite corrió contra la **app
compilada** en el 3203 con una config temporal (borrada al terminar). La config del proyecto
(`playwright.config.ts`, puerto 3202, `reuseExistingServer: false`) no se tocó: cuando no haya un
`next dev` en la carpeta, `npx playwright test` corre tal cual está.

## Capacidad `tema` (CA-1, CA-2, CA-3, reglas 2 y 3)

| Requisito | Test | Resultado |
|---|---|---|
| Tema generado por un comando | `tests/tema/generador.test.ts`, `tests/tema/coincidencia.test.ts` (CA-2: los dos archivos son, línea por línea, lo que el comando genera) | verde |
| Un cambio de la fuente llega al tema | `tests/tema/generador.test.ts` (los 42 colores en cada modo, las 8 series, los estados) y el experimento de la 7.6 (anexo) | verde |
| Cobertura del tema | `tests/tema/generador.test.ts`, `tests/tema/estilos-texto.test.ts`, `tests/tema/radios.test.ts` | verde |
| Ningún valor visual literal | `tests/tema/sin-literales.test.ts` (CA-1) | verde |
| Modo claro y oscuro | `e2e/modo.spec.ts` (CA-3) | verde |
| Tema copiable a otra aplicación | `tests/tema/coincidencia.test.ts` (declara ser generado, desde qué fuente y con qué fecha, y no tiene ningún `@import`) | verde |
| Una sola tipografía | `e2e/fundamentos.spec.ts` («todos los estilos usan la misma familia y ningún peso fuera de los de la fuente») | verde |

## Capacidad `estructura-app` (CA-4, CA-8, sección 5.3)

| Requisito | Test | Resultado |
|---|---|---|
| Barra lateral con secciones agrupadas | `e2e/estructura.spec.ts` | verde |
| Encabezado de sección | `e2e/estructura.spec.ts` | verde |
| Barra lateral como cajón en pantallas angostas | `e2e/estructura-390.spec.ts` (CA-4) | verde |
| Navegación con teclado | `e2e/teclado-armazon.spec.ts` (CA-8) | verde |

## Capacidad `componentes-base` (CA-1, CA-8, sección 5.4)

| Requisito | Test | Resultado |
|---|---|---|
| Inventario de componentes base | `tests/componentes/inventario.test.tsx` (los 14, con su lista) | verde |
| Apariencia según el tema | `tests/componentes/inventario.test.tsx`, `tests/tema/sin-literales.test.ts` | verde |
| Operación con teclado | `tests/componentes/teclado.test.tsx`, `tests/componentes/anillo-de-foco.test.tsx` (tarea 7.1b) y `e2e/teclado-armazon.spec.ts` | verde |
| Los estados no se comunican solo por color | `tests/componentes/estados.test.tsx` | verde |

## Capacidad `pantalla-fundamentos` (sección 5.2, guía visual)

| Requisito | Test | Resultado |
|---|---|---|
| Colores con nombre y valor | `e2e/fundamentos.spec.ts` («la tabla de colores de fundamentos») | verde |
| Estilos de texto | `e2e/fundamentos.spec.ts` («los estilos de texto de fundamentos») | verde |
| Escala de espacio y radios | `e2e/fundamentos.spec.ts` («la escala de espacio y los radios de fundamentos») | verde |
| Colores de gráficos y estados | `e2e/fundamentos.spec.ts` («las series de gráfico y los estados de fundamentos») | verde |
| Logos con su regla de uso | `e2e/fundamentos.spec.ts` («los logos de fundamentos») | verde |
| Lo que se muestra sale de la fuente de valores | `tests/fundamentos/coincidencia.test.ts` (CA-2) y el anexo | verde |

## Capacidad `capturas` (CA-10)

| Requisito | Test | Resultado |
|---|---|---|
| Comando de capturas | `npm run capturas` (`scripts/capturas.mjs`) y `tests/capturas/capturas.test.ts` | verde |
| Nombres predecibles | `tests/capturas/capturas.test.ts` y dos corridas seguidas sin cambios (tarea 6.3) | verde |
| Las capturas se versionan | `git ls-files docs/capturas \| wc -l` → **24**, y el diff de este cambio las muestra | verde |
| Una captura faltante o vacía rompe la verificación | `tests/capturas/capturas.test.ts` (CA-10) | verde |

## Capturas a revisar

Las 24 están en `docs/capturas/`, versionadas: **6 pantallas × 2 modos × 2 anchos**.

| Pantalla | Archivos |
|---|---|
| Inicio | `inicio-{claro,oscuro}-{1280,390}.png` |
| Fundamentos | `fundamentos-{claro,oscuro}-{1280,390}.png` |
| Clientes | `clientes-{claro,oscuro}-{1280,390}.png` |
| Nuevo cliente | `clientes-nuevo-{claro,oscuro}-{1280,390}.png` |
| Ingreso | `ingreso-{claro,oscuro}-{1280,390}.png` |
| Estados | `estados-{claro,oscuro}-{1280,390}.png` |

Las **4 de fundamentos** son las que cambiaron en las últimas tareas (la pantalla ganó sus cinco
secciones: colores, estilos de texto, espacio y radios, series y estados, y logos). Las otras 20
salieron idénticas en la última corrida del comando.

## Anexo: la coincidencia de la pantalla de fundamentos con la fuente (tarea 7.6)

Requisito: *Lo que se muestra sale de la fuente de valores* (CA-2, regla 2).

El experimento: `page-title` de **24px a 26px** en `sistema/tokens.json`, sin tocar la pantalla.

| Escenario de la spec | Cómo se probó | Resultado |
|---|---|---|
| Un valor nuevo se ve en la pantalla | Con el valor cambiado en la fuente: `npm run tema` y `npx playwright test e2e/fundamentos.spec.ts -g "cada estilo se dibuja"` | **Verde**: el navegador dibuja el texto en 26px, sin editar la pantalla |
| La pantalla quedó con un valor viejo | El mismo cambio **sin** regenerar el tema | **Rojo**, nombrando el valor: `page-title: se dibuja en 24px y la fuente dice 26px` |
| El test sin navegador | `npm test` (`tests/fundamentos/coincidencia.test.ts`) | Verde en los dos casos, y vale decirlo: compara los **datos** que la pantalla muestra contra la fuente (los dos lados salen del mismo archivo), así que no puede ver un tema sin regenerar. Eso lo cubre el navegador |

Después del experimento se restauraron la fuente y el tema: `sistema/tokens.json`,
`sistema/aggility-theme.css` y `src/app/aggility-theme.css` quedaron **idénticos a HEAD**
(`git diff --exit-code` sin salida).
