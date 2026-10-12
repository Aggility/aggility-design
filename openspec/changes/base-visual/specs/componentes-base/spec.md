# Spec Delta

## Purpose

Deja disponible el juego de componentes base de la interfaz, con la apariencia del sistema y usables con teclado, para que ninguna pantalla tenga que inventarlos ni reescribirlos.

## ADDED Requirements

### Requirement: Inventario de componentes base

Los componentes base de la sección 5.4 SHALL estar disponibles: botón, campo, selector, casilla, diálogo, cajón, menú desplegable, tabla, insignia, tarjeta, separador, tooltip, avatar y aviso (sección 5.4).

#### Scenario: Cada componente de la lista está disponible

- **WHEN** se usa cualquiera de los componentes de la lista
- **THEN** se ve con la apariencia del sistema, en claro y en oscuro

#### Scenario: Volver a generarlos no pierde trabajo

- **WHEN** se vuelven a generar los componentes base con la herramienta oficial para actualizarlos
- **THEN** no se pierde ninguna adaptación hecha a mano, porque no hay ninguna adaptación hecha a mano

#### Scenario: Falta un componente de la lista

- **WHEN** una pantalla necesita un componente de la lista y todavía no está disponible
- **THEN** el trabajo se detiene y queda anotado como bloqueo, en lugar de escribirse a mano

### Requirement: Apariencia según el tema

Los componentes base SHALL tomar todos sus colores, tamaños de letra y radios de las clases del tema, y SHALL verse igual en cualquier pantalla donde se usen (CA-1, regla 2).

#### Scenario: Cambiar un valor cambia el componente

- **WHEN** cambia un valor en la fuente de valores y se regenera el tema
- **THEN** los componentes base se ven con el valor nuevo, sin tocar su código

#### Scenario: Un valor literal en un componente base

- **WHEN** un componente base trae un color, un tamaño de letra o un radio literal
- **THEN** la verificación de valores literales falla y el componente se corrige con la herramienta oficial, no a mano (CA-1)

### Requirement: Operación con teclado

Todo control de los componentes base SHALL poder usarse sin mouse, SHALL mostrar el anillo de foco del sistema al recibir el foco y SHALL informar su estado a las ayudas técnicas (CA-8).

#### Scenario: El foco se ve en cada control

- **WHEN** la persona recorre con Tab un botón, un campo, un selector y una casilla
- **THEN** cada uno muestra el anillo de foco del sistema mientras tiene el foco

#### Scenario: Cerrar sin mouse

- **WHEN** un diálogo, un cajón, un menú desplegable o un tooltip está abierto y la persona presiona Escape
- **THEN** se cierra y el foco vuelve al elemento que lo abrió

#### Scenario: Operar dentro de un menú o un selector

- **WHEN** un menú desplegable o un selector tiene el foco
- **THEN** la persona puede recorrer las opciones con las flechas y elegir con Enter

#### Scenario: Marcar una casilla sin mouse

- **WHEN** una casilla tiene el foco y la persona presiona Espacio
- **THEN** la casilla cambia de estado y el cambio se anuncia

### Requirement: Los estados no se comunican solo por color

Avisos, insignias y mensajes SHALL acompañar el color con una palabra o un ícono, y SHALL usar el estado que corresponde: bueno, necesita atención, o error para lo que falla y para lo que borra (guía visual: Color y Estados, regla 5).

#### Scenario: Un aviso de error explica qué pasó

- **WHEN** una operación falla y la pantalla muestra el error
- **THEN** el aviso dice qué pasó y cómo seguir, con una palabra además del color, sin disculpas ni signos de exclamación

#### Scenario: Una acción que borra se anuncia

- **WHEN** una pantalla ofrece una acción que borra
- **THEN** la acción se ve con el estado de error y lleva una palabra o un ícono que lo dice

#### Scenario: El estado no reemplaza al texto

- **WHEN** se quita el color de un aviso o de una insignia de la vista
- **THEN** el mensaje sigue siendo comprensible, porque el color no era lo único que lo explicaba
