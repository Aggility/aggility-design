import { CircleAlert, CircleCheck, TriangleAlert, type LucideIcon } from "lucide-react";

/** Los estados del sistema: `success`, `warning` y `destructive`, según la guía. */
export type NombreDeEstado = "bueno" | "atencion" | "error";

/**
 * Cada estado con su palabra, su ícono y el color del sistema que le toca.
 *
 * La guía es explícita: los estados siempre van con una palabra, un signo o un ícono, nunca
 * sólo con el color, y `destructive` es sólo para errores y para acciones que borran.
 */
export const ESTADOS: Record<
  NombreDeEstado,
  { palabra: string; Icono: LucideIcon; clase: string }
> = {
  bueno: { palabra: "Bueno", Icono: CircleCheck, clase: "text-success" },
  atencion: { palabra: "Atención", Icono: TriangleAlert, clase: "text-warning" },
  error: { palabra: "Error", Icono: CircleAlert, clase: "text-destructive" },
};
