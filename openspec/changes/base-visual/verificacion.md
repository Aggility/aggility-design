# Verificación — base-visual

> Este archivo lo completa la tarea 8.2: una fila por requisito de las cinco capacidades con su
> test y su resultado, más la lista de capturas a revisar. Acá empieza con lo que pidió la 7.6.

## Coincidencia de la pantalla de fundamentos con la fuente (7.6)

Requisito: *Lo que se muestra sale de la fuente de valores* (`specs/pantalla-fundamentos/spec.md`, CA-2, regla 2).

El experimento: `page-title` de **24px a 26px** en `sistema/tokens.json`, sin tocar la pantalla.

| Escenario de la spec | Cómo se probó | Resultado |
|---|---|---|
| Un valor nuevo se ve en la pantalla | Con el valor cambiado en la fuente: `npm run tema` y `npx playwright test e2e/fundamentos.spec.ts -g "cada estilo se dibuja"` | **Verde**: el navegador dibuja el texto en 26px, sin editar la pantalla |
| La pantalla quedó con un valor viejo | El mismo cambio **sin** regenerar el tema | **Rojo**, nombrando el valor: `page-title: se dibuja en 24px y la fuente dice 26px` |
| El test sin navegador | `npm test` (`tests/fundamentos/coincidencia.test.ts`, 5 casos) | Verde en los dos casos, y vale decirlo: compara los **datos** que la pantalla muestra contra la fuente (los dos lados salen del mismo archivo), así que no puede ver un tema sin regenerar. Eso lo cubre el navegador |

Después del experimento se restauraron la fuente y el tema: `sistema/tokens.json`,
`sistema/aggility-theme.css` y `src/app/aggility-theme.css` quedaron **idénticos a HEAD**
(`git diff --exit-code` sin salida) y la suite completa en verde: 39 tests de Vitest y 64 de
Playwright (16 saltados a propósito, los de escritorio o de pantalla angosta según el caso).
