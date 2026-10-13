import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AVISOS } from "@/components/estados/avisos";
import { ESTADOS, type NombreDeEstado } from "@/components/estados/estados";
import { InsigniaDeEstado } from "@/components/estados/insignia-de-estado";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Los colores de estado del sistema: los mismos que nombra la guía. */
const COLORES_DE_ESTADO = ["text-success", "text-warning", "text-destructive"];

describe("los estados y los avisos (sección 5.4)", () => {
  afterEach(cleanup);

  it("cada estado lleva su palabra y su ícono, y nunca se comunica sólo con el color", () => {
    const fallas: string[] = [];

    for (const [nombre, estado] of Object.entries(ESTADOS)) {
      if (estado.palabra.trim() === "") {
        fallas.push(`${nombre}: no tiene palabra`);
      }
      if (!estado.Icono) {
        fallas.push(`${nombre}: no tiene ícono`);
      }
      if (!COLORES_DE_ESTADO.includes(estado.clase)) {
        fallas.push(`${nombre}: no usa un color de estado del sistema (${estado.clase})`);
      }
    }

    expect(fallas).toEqual([]);
    expect(Object.keys(ESTADOS)).toEqual(["bueno", "atencion", "error"]);

    // Y se ve en pantalla: la insignia muestra la palabra junto al color del sistema.
    for (const nombre of Object.keys(ESTADOS) as NombreDeEstado[]) {
      const { palabra, clase } = ESTADOS[nombre];
      const { container } = render(<InsigniaDeEstado estado={nombre} />);

      expect(container.textContent, `"${nombre}" se lee`).toContain(palabra);
      expect(container.innerHTML, `"${nombre}" usa el color del sistema`).toContain(clase);
    }
  });

  it("los avisos dicen qué pasó y cómo seguir, sin disculpas ni signos de exclamación", () => {
    const disculpas = /(lo siento|perd[oó]n|disculp|lamentablemente|qu[eé] l[aá]stima)/i;
    const fallas: string[] = [];

    for (const [nombre, aviso] of Object.entries(AVISOS)) {
      if (aviso.quePaso.trim() === "") {
        fallas.push(`${nombre}: no dice qué pasó`);
      }
      if (aviso.comoSeguir.trim() === "") {
        fallas.push(`${nombre}: no dice cómo seguir`);
      }

      const texto = `${aviso.quePaso} ${aviso.comoSeguir}`;

      if (texto.includes("!")) {
        fallas.push(`${nombre}: tiene signo de exclamación`);
      }
      if (disculpas.test(texto)) {
        fallas.push(`${nombre}: se disculpa`);
      }
    }

    expect(fallas).toEqual([]);

    // El aviso se muestra con el bloque del sistema, con su estado.
    const { estado, quePaso, comoSeguir } = AVISOS.metaSinRespuesta;
    const { container } = render(
      <Alert variant={estado === "error" ? "destructive" : "default"}>
        <AlertTitle>{quePaso}</AlertTitle>
        <AlertDescription>{comoSeguir}</AlertDescription>
      </Alert>,
    );

    expect(container.textContent).toContain(quePaso);
    expect(container.textContent).toContain(comoSeguir);
  });

  it("una acción que borra se anuncia con el estado de error", () => {
    expect(AVISOS.borrarCliente.estado, "el borrado que falla se anuncia con el error").toBe("error");
    expect(AVISOS.confirmarBorrado.estado, "y la confirmación de borrar también").toBe("error");
    expect(ESTADOS.error.clase, "que es el color destructivo del sistema").toBe("text-destructive");
  });
});
