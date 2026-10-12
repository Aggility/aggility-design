# Spec — Sistema de diseño Aggility

**Estado:** v1.0, para aprobar · **Fecha:** 12/10/2026 · **Responsable:** Germán

Lo marcado como *(a confirmar)* es una propuesta que todavía no fue validada.

---

## 1. Problema

Cada herramienta de Aggility se ve distinta: Horace usa el azul de la marca, la app de gestión un violeta, el sitio web su propio oscuro. Cuando un agente construye una pantalla sin una referencia concreta, inventa un diseño, y el primer diseño de la app de gestión y del Marketing Hub anterior se descartó por eso.

Ya existe el sistema visual de Aggility (`sistema/`): colores en claro y oscuro, tipografía, espacios, radios, colores de gráficos y reglas de uso. Lo que falta es verlo aplicado en pantallas reales que un agente pueda copiar.

## 2. Objetivo

Una app Next.js con el tema de Aggility, sus componentes y pantallas de muestra con datos de ejemplo. Es la referencia que se copia al construir cualquier herramienta de Aggility, empezando por el Marketing Hub.

## 3. Usuarios

- Germán, que revisa cómo se ve.
- Los agentes que construyen las apps de Aggility: copian el tema, los componentes y la estructura de las pantallas.

## 4. Lo que ya existe

- `sistema/tokens.json`: la fuente de todos los valores (colores por modo, tipografía, espacios, radios).
- `sistema/aggility-theme.css`: el tema para Tailwind v4 y shadcn/ui, generado desde `tokens.json`.
- `sistema/guia.md`: las reglas de uso. Manda sobre cualquier decisión visual de esta app.
- El mismo sistema publicado como artifact de Claude ("Aggility"), con los logos.
- `sistema/logos/`: los logos de Aggility (copiados de `aggility-website/design/`). Cuáles van en fondo claro u oscuro está en `sistema/guia.md`.

## 5. Alcance v1

### 5.1 Tema
- El tema sale de `sistema/aggility-theme.css`, que se genera desde `sistema/tokens.json` con un comando.
- Modo claro y oscuro con un selector en el encabezado. Sin elección guardada, sigue al sistema operativo; la elección se recuerda en el dispositivo.
- Tipografía Inter.

### 5.2 Fundamentos
- Una pantalla que muestra el sistema aplicado: colores con su nombre y valor en cada modo, estilos de texto, espacios, radios, colores de gráficos y estados, y los logos.

### 5.3 Estructura de la app
- Barra lateral con secciones agrupadas e íconos, la sección actual destacada, el logo de Aggility arriba y el menú del usuario abajo.
- Encabezado con el título de la sección, el selector de modo y una acción principal cuando la pantalla tiene una.
- En pantallas angostas, la barra lateral se abre como cajón con un botón de menú.

### 5.4 Componentes
- Base, generados con la CLI oficial de shadcn: botón, campo, select, casilla, diálogo, cajón, menú desplegable, tabla, insignia, tarjeta, separador, tooltip, avatar, aviso.
- Propios:
  - Tarjeta de KPI: rótulo, valor, variación con signo y período, y estado.
  - Gráfico de línea y gráfico de barras.
  - Tabla con filtros.
  - Selector de rango de fechas (últimos 7, 30 y 90 días, este mes).
  - Encabezado de página.
  - Estado vacío.
  - Insignia de estado.

### 5.5 Pantallas de muestra
1. **Tablero de un cliente:** 4 KPIs (inversión, conversiones, costo por conversión, sesiones), tendencia diaria, inversión por fuente y tabla de campañas, con selector de rango y filtro por fuente.
2. **Lista con filtros:** lista de clientes con búsqueda, filtros y acción "Nuevo cliente".
3. **Formulario largo** en pantalla propia (alta de cliente) y **formulario corto** en diálogo.
4. **Ingreso.**
5. **Estados:** vacío, cargando, error y sin acceso.

Los datos son de ejemplo, ficticios, sin nombres de clientes reales, y la pantalla lo indica.

## 6. Fuera de alcance (v1)

- Conexión a datos reales y autenticación real: el ingreso es solo la pantalla.
- Publicarlo como registro de shadcn: es el cambio `registro-shadcn` del roadmap.
- Adoptar el tema en Horace o en la app de gestión: se hace en cada repo.

## 7. Reglas

1. `sistema/guia.md` manda en toda decisión visual. Si algo de esta spec la contradice, frenar y avisar.
2. `sistema/tokens.json` es la única fuente de valores. Ningún componente usa un color, tamaño de letra o radio literal: todo sale de los tokens.
3. Para cambiar un valor se cambia `tokens.json` y se regenera el tema. No se edita `aggility-theme.css` a mano.
4. No se copia código de Horace ni de la app de gestión. Se pueden mirar como referencia visual.
5. Textos en español de Argentina con voseo, números con punto de miles y coma decimal, siempre con su período.
6. Cada fuente de datos tiene un color fijo en toda la app: Meta `chart-1`, Google Ads `chart-2`, Search Console `chart-3`, GA4 `chart-4`. *(a confirmar)*

## 8. Criterios de aceptación

- **CA-1** Ningún archivo de `src/` usa un color literal (hex, `rgb()`, `oklch()`, `hsl()`): un test lo comprueba.
- **CA-2** `npm run tema` regenera `sistema/aggility-theme.css` desde `tokens.json`, y un test falla si el archivo no coincide con lo que genera.
- **CA-3** Sin elección guardada y con el sistema operativo en oscuro, la app se ve en oscuro. Si el usuario elige claro y recarga, sigue en claro.
- **CA-4** A 390 px de ancho ninguna pantalla tiene desplazamiento horizontal, y la barra lateral solo aparece al tocar el botón de menú.
- **CA-5** El tablero muestra 4 KPIs, cada uno con valor, variación con signo y período. Una variación favorable se ve en `success` y una desfavorable en `destructive`, siempre con su signo.
- **CA-6** En "inversión por fuente", al ocultar Google Ads con el filtro, Meta, Search Console y GA4 conservan su color.
- **CA-7** Cada gráfico tiene un solo eje vertical, leyenda cuando muestra 2 series o más, y un tooltip con el valor al pasar el mouse o tocar un punto.
- **CA-8** Todos los controles se pueden usar con teclado y muestran el anillo de foco `ring`.
- **CA-9** Una lista sin resultados muestra qué va a aparecer ahí y la acción para empezar. Un error dice qué pasó y cómo seguir.
- **CA-10** Hay una captura de cada pantalla en claro y en oscuro, a 1280 y a 390 px de ancho, en `docs/capturas/`, generada por un comando (`npm run capturas`).

## 9. Pendientes

1. Si se publica en Vercel para verla desde cualquier lado. *(a confirmar)*
2. La asignación de colores por fuente de la regla 6.
