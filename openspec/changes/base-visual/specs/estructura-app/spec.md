# Spec Delta

## Purpose

Define el armazón que comparten todas las pantallas de Aggility: dónde se navega entre secciones, dónde se cambia el modo, y cómo se comporta todo eso en un teléfono, para que cada herramienta nueva no tenga que decidirlo otra vez.

## ADDED Requirements

### Requirement: Barra lateral con secciones agrupadas

La aplicación SHALL mostrar una barra lateral con las secciones agrupadas, cada ítem con su ícono, la sección actual destacada, el logo de Aggility arriba y el menú del usuario abajo (sección 5.3, guía visual: Color).

#### Scenario: La sección actual se distingue

- **WHEN** la persona entra a una sección
- **THEN** el ítem de esa sección se ve destacado con los colores del sistema y los demás ítems no

#### Scenario: Los grupos se distinguen entre sí

- **WHEN** la barra lateral tiene más de un grupo de secciones
- **THEN** cada grupo se ve separado y con su título

#### Scenario: Los ítems llevan ícono

- **WHEN** se recorre la barra lateral
- **THEN** cada ítem tiene su ícono, ningún ícono es un emoji y el logo se ve nítido en los dos modos

### Requirement: Encabezado de sección

La aplicación SHALL mostrar un encabezado con el título de la sección actual y el selector de modo, y SHALL mostrar además una acción principal solo cuando la pantalla tiene una (sección 5.3, guía visual: Tipografía).

#### Scenario: El título sigue a la sección

- **WHEN** la persona cambia de sección
- **THEN** el encabezado muestra el título de la sección nueva y lo muestra una sola vez en la vista

#### Scenario: Una pantalla sin acción principal

- **WHEN** la pantalla no tiene una acción principal que ofrecer
- **THEN** el encabezado no muestra ningún botón de acción, y no queda un espacio vacío reservado para uno

#### Scenario: Hay una acción principal

- **WHEN** la pantalla sí tiene una acción principal
- **THEN** el encabezado la muestra como el único botón principal de la vista

### Requirement: Barra lateral como cajón en pantallas angostas

En pantallas angostas la barra lateral SHALL permanecer oculta hasta que la persona toque el botón de menú, SHALL abrirse como cajón y SHALL cerrarse al elegir una sección o al tocar fuera de ella (CA-4).

#### Scenario: A 390 px no hay desplazamiento horizontal

- **WHEN** una pantalla se abre a 390 px de ancho, en claro y en oscuro
- **THEN** la pantalla no tiene desplazamiento horizontal y la barra lateral no ocupa lugar hasta que se toca el botón de menú

#### Scenario: Abrir y cerrar el cajón

- **WHEN** la persona toca el botón de menú y después elige una sección
- **THEN** el cajón se abre, la sección cambia y el cajón se cierra

#### Scenario: Cerrar sin elegir nada

- **WHEN** la persona toca fuera del cajón o presiona Escape
- **THEN** el cajón se cierra y la sección sigue siendo la misma

#### Scenario: Con el cajón cerrado se lee todo

- **WHEN** el cajón está cerrado a 390 px
- **THEN** el contenido de la pantalla se puede leer completo, sin quedar tapado por el cajón ni por el botón de menú

### Requirement: Navegación con teclado

Los ítems de la barra lateral y el botón de menú SHALL poder usarse con el teclado y SHALL mostrar el anillo de foco del sistema al recibir el foco (CA-8).

#### Scenario: Recorrer la navegación con Tab

- **WHEN** la persona recorre la barra lateral con Tab
- **THEN** cada ítem recibe el foco en un orden que sigue a la pantalla y muestra el anillo de foco del sistema

#### Scenario: Activar un ítem con el teclado

- **WHEN** un ítem de la barra lateral tiene el foco y la persona presiona Enter o Espacio
- **THEN** la pantalla cambia a esa sección, igual que al hacer clic

#### Scenario: Abrir el cajón con el teclado

- **WHEN** el botón de menú tiene el foco a 390 px y la persona presiona Enter o Espacio
- **THEN** el cajón se abre y el foco pasa al primer ítem de la barra lateral
