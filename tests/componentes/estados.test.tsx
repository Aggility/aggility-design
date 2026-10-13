import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AVISOS } from "@/components/estados/avisos";
import { ESTADOS, type NombreDeEstado } from "@/components/estados/estados";
import { InsigniaDeEstado } from "@/components/estados/insignia-de-estado";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** Los colores de estado del sistema: los mismos que nombra la guía. */
const COLORES_DE_ESTADO = ["text-success", "text-warning", "text-destructive"];

/** La fuente de valores: la pantalla de fundamentos y esta regla salen de ahí. */
const FUENTE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "sistema",
  "tokens.json",
);

interface Token {
  name: string;
  value: string | { light: string; dark: string };
}

/** Los valores de un token, uno por modo (o el mismo si la fuente lo declara una sola vez). */
function valoresDe(valor: Token["value"]): string[] {
  return typeof valor === "string" ? [valor] : [valor.light, valor.dark];
}

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

  it("el color de un estado no se usa como color de una serie (guía: Color)", () => {
    // La guía lo dice al revés también: los estados son de texto e íconos, nunca el color de una
    // serie. La regla se puede comprobar porque las dos cosas salen de la misma fuente.
    const fuente = JSON.parse(readFileSync(FUENTE, "utf8")) as { color: { tokens: Token[] } };
    const tokens = fuente.color.tokens;

    const deSerie = new Set(
      tokens.filter((token) => /^chart-/.test(token.name)).flatMap((token) => valoresDe(token.value)),
    );
    const deEstado = tokens.filter((token) => /^(success|warning|destructive)$/.test(token.name));

    expect(deSerie.size, "la fuente tiene series de gráfico").toBeGreaterThan(0);
    expect(
      [...deEstado.map((token) => token.name)].sort(),
      "la fuente tiene los tres estados",
    ).toEqual(["destructive", "success", "warning"]);

    const fallas: string[] = [];

    for (const [nombre, estado] of Object.entries(ESTADOS)) {
      const token = estado.clase.replace(/^text-/, "");
      const valores = valoresDe(tokens.find((candidato) => candidato.name === token)?.value ?? "");

      if (/chart-/.test(token)) {
        fallas.push(`${nombre}: usa el color de una serie (${estado.clase})`);
      }

      for (const valor of valores) {
        if (deSerie.has(valor)) {
          fallas.push(`${nombre}: comparte el valor ${valor} con una serie de gráfico`);
        }
      }
    }

    expect(fallas, "los estados no se pintan con el color de una serie").toEqual([]);
  });
});
