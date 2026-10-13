import type { NombreDeEstado } from "@/components/estados/estados";

/**
 * Los avisos de la app, con lo que la guía pide: dicen qué pasó y cómo seguir, con voseo y
 * sin disculpas ni signos de exclamación.
 */
export const AVISOS = {
  metaSinRespuesta: {
    estado: "error" as NombreDeEstado,
    quePaso: "La cuenta de Meta no respondió.",
    comoSeguir: "Probá sincronizar de nuevo en unos minutos.",
  },
  tokenPorVencer: {
    estado: "atencion" as NombreDeEstado,
    quePaso: "El token de Google Ads vence en 5 días.",
    comoSeguir: "Renovalo desde la cuenta conectada.",
  },
  borrarCliente: {
    estado: "error" as NombreDeEstado,
    quePaso: "No se pudo borrar el cliente.",
    comoSeguir: "Probá de nuevo y, si sigue igual, avisanos.",
  },
  /** La confirmación antes de borrar: la guía la quiere con el estado de error. */
  confirmarBorrado: {
    estado: "error" as NombreDeEstado,
    quePaso: "Vas a borrar el cliente y sus datos no se recuperan.",
    comoSeguir: "Si estás seguro, confirmá el borrado.",
  },
} as const;
