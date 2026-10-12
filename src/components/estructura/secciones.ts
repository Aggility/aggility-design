import { House, Layers, LogIn, Palette, UserPlus, Users, type LucideIcon } from "lucide-react";

/** Una sección de la barra lateral: la pantalla a la que lleva y su ícono. */
export interface Seccion {
  /** El título: lo muestra el ítem de la barra y el encabezado de la pantalla. */
  titulo: string;
  href: string;
  Icono: LucideIcon;
  /** La acción principal de esa pantalla, cuando la tiene: el encabezado la muestra. */
  accion?: { etiqueta: string; href: string };
}

/** Las secciones agrupadas: la barra lateral muestra un grupo por cada uno. */
export interface GrupoDeSecciones {
  titulo: string;
  secciones: Seccion[];
}

/**
 * Las secciones de este proyecto. No es la navegación de ninguna herramienta real: son
 * las pantallas de muestra, que llegan en los cambios siguientes (`pantallas-muestra`
 * para las de muestra, este cambio para Fundamentos).
 */
export const GRUPOS: GrupoDeSecciones[] = [
  {
    titulo: "Sistema de diseño",
    secciones: [
      { titulo: "Inicio", href: "/", Icono: House },
      { titulo: "Fundamentos", href: "/fundamentos", Icono: Palette },
    ],
  },
  {
    titulo: "Pantallas de muestra",
    secciones: [
      { titulo: "Clientes", href: "/clientes", Icono: Users, accion: { etiqueta: "Nuevo cliente", href: "/clientes/nuevo" } },
      { titulo: "Nuevo cliente", href: "/clientes/nuevo", Icono: UserPlus },
      { titulo: "Ingreso", href: "/ingreso", Icono: LogIn },
      { titulo: "Estados", href: "/estados", Icono: Layers },
    ],
  },
];

export const SECCIONES: Seccion[] = GRUPOS.flatMap((grupo) => grupo.secciones);

/** La sección de una ruta, o `undefined` si la ruta no es una de la barra lateral. */
export function seccionDeLaRuta(ruta: string): Seccion | undefined {
  return SECCIONES.find((seccion) => seccion.href === ruta);
}

/** Datos de ejemplo: el sistema no tiene autenticación (spec, sección 6). */
export const USUARIO = {
  nombre: "Camila Duarte",
  rol: "Administradora",
};
