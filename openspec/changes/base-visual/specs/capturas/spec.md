# Spec Delta

## Purpose

Deja una prueba visual revisable de cada pantalla, en los dos modos y en los dos anchos, para que Germán pueda revisar el resultado sin abrir el proyecto y para que un cambio visual se note en el diff antes de archivar.

## ADDED Requirements

### Requirement: Comando de capturas

Un comando SHALL generar una captura de cada pantalla de la aplicación en claro y en oscuro, a 1280 y a 390 px de ancho, y SHALL dejarlas en `docs/capturas/` (CA-10).

#### Scenario: El comando deja el juego completo

- **WHEN** se ejecuta el comando de capturas
- **THEN** queda una captura por cada pantalla, por cada modo y por cada ancho, y la cantidad coincide con pantallas × 2 modos × 2 anchos

#### Scenario: Una pantalla no renderiza

- **WHEN** una pantalla falla al renderizar
- **THEN** el comando falla y nombra la pantalla, en lugar de dejar capturas incompletas sin avisar

#### Scenario: Una pantalla nueva queda cubierta

- **WHEN** se agrega una pantalla a la aplicación
- **THEN** el comando la captura también, sin que haya que darla de alta en una lista aparte

### Requirement: Nombres predecibles

El nombre de cada captura SHALL decir la pantalla, el modo y el ancho, y SHALL ser el mismo en cada corrida (CA-10).

#### Scenario: El nombre identifica la captura

- **WHEN** se listan las capturas de `docs/capturas/`
- **THEN** el nombre de cada archivo permite saber a qué pantalla, a qué modo y a qué ancho corresponde

#### Scenario: Correr el comando dos veces

- **WHEN** se ejecuta el comando dos veces seguidas sobre el mismo código
- **THEN** los nombres de los archivos son los mismos y no se acumulan capturas sueltas

### Requirement: Las capturas se versionan

Las capturas SHALL quedar en el repositorio, de modo que aparezcan en el diff de un cambio y Germán pueda revisarlas antes de archivar (CA-10).

#### Scenario: Un cambio visible aparece en el diff

- **WHEN** se cambia algo visible de una pantalla y se ejecuta el comando de capturas
- **THEN** el repositorio muestra esa captura como modificada

#### Scenario: Un cambio sin efecto visual

- **WHEN** un cambio no modifica nada visible y se ejecuta el comando de capturas
- **THEN** las capturas quedan iguales y el repositorio no muestra cambios en ellas

### Requirement: Una captura faltante o vacía rompe la verificación

La verificación SHALL fallar cuando falta la captura de una pantalla, de un modo o de un ancho, o cuando una captura quedó vacía (CA-10).

#### Scenario: Falta una captura

- **WHEN** se borra una de las capturas esperadas
- **THEN** la verificación falla y nombra la captura que falta

#### Scenario: Una captura quedó vacía

- **WHEN** una captura existe pero no tiene contenido
- **THEN** la verificación falla y nombra esa captura

#### Scenario: La verificación pasa

- **WHEN** el juego de capturas está completo y sin cambios respecto de la última corrida
- **THEN** la verificación queda en verde
