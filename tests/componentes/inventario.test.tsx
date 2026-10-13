import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Sheet } from "@/components/ui/sheet";
import { Table } from "@/components/ui/table";
import { Tooltip, TooltipProvider } from "@/components/ui/tooltip";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const UI = path.join(RAIZ, "src", "components", "ui");

/** Los 14 componentes base de la sección 5.4, con el nombre que les da la spec. */
const COMPONENTES = [
  { nombre: "botón", archivo: "button", como: () => <Button>Guardar cliente</Button> },
  { nombre: "campo", archivo: "input", como: () => <Input aria-label="Correo" /> },
  { nombre: "selector", archivo: "select", como: () => <Select /> },
  { nombre: "casilla", archivo: "checkbox", como: () => <Checkbox aria-label="Acepto" /> },
  { nombre: "diálogo", archivo: "dialog", como: () => <Dialog /> },
  { nombre: "cajón", archivo: "sheet", como: () => <Sheet /> },
  { nombre: "menú desplegable", archivo: "dropdown-menu", como: () => <DropdownMenu /> },
  { nombre: "tabla", archivo: "table", como: () => <Table /> },
  { nombre: "insignia", archivo: "badge", como: () => <Badge>Bueno</Badge> },
  { nombre: "tarjeta", archivo: "card", como: () => <Card /> },
  { nombre: "separador", archivo: "separator", como: () => <Separator /> },
  {
    nombre: "tooltip",
    archivo: "tooltip",
    como: () => (
      <TooltipProvider>
        <Tooltip />
      </TooltipProvider>
    ),
  },
  { nombre: "avatar", archivo: "avatar", como: () => <Avatar /> },
  { nombre: "aviso", archivo: "alert", como: () => <Alert /> },
];

const MEDIDA = String.raw`[\d.]+(?:px|rem|em|%)`;
const COMILLAS = `["'${String.fromCharCode(96)}]?`;

const LITERALES = {
  color: [/#[0-9a-fA-F]{3,8}\b/, /\b(?:rgba?|hsla?|oklcha?|oklab|hwb|lab|lch)\(/i],
  tamaño: [
    new RegExp(String.raw`font-size\s*:\s*${MEDIDA}`),
    new RegExp(String.raw`fontSize\s*:\s*${COMILLAS}${MEDIDA}`),
    new RegExp(String.raw`text-\[[^\]]*${MEDIDA}[^\]]*\]`),
  ],
  radio: [
    new RegExp(String.raw`border-radius\s*:\s*${MEDIDA}`),
    new RegExp(String.raw`borderRadius\s*:\s*${COMILLAS}${MEDIDA}`),
    new RegExp(String.raw`rounded-\[[^\]]*${MEDIDA}[^\]]*\]`),
  ],
};

/** Los literales de un tipo que hay en un componente, uno por línea. */
function literalesDe(archivo: string, tipo: keyof typeof LITERALES): string[] {
  const contenido = readFileSync(path.join(UI, archivo), "utf8");

  return contenido
    .split("\n")
    .flatMap((linea, indice) =>
      LITERALES[tipo]
        .filter((patron) => patron.test(linea))
        .map((patron) => `${archivo}:${indice + 1} (${patron.source}): ${linea.trim().slice(0, 70)}`),
    );
}

describe("el inventario de componentes base (sección 5.4)", () => {
  it("son 14, están todos y ninguno se escribe a mano", () => {
    const enDisco = readdirSync(UI).filter((nombre) => nombre.endsWith(".tsx"));
    const faltan = COMPONENTES.filter(({ archivo }) => !enDisco.includes(`${archivo}.tsx`)).map(
      ({ archivo }) => `${archivo}.tsx`,
    );

    expect(faltan).toEqual([]);
    expect(COMPONENTES).toHaveLength(14);
    console.log(
      `Los 14 componentes base: ${COMPONENTES.map(({ nombre, archivo }) => `${nombre} (${archivo}.tsx)`).join(", ")}`,
    );
  });

  it("renderizan sin errores", () => {
    const fallas: string[] = [];

    for (const { nombre, como } of COMPONENTES) {
      try {
        render(como());
      } catch (error) {
        fallas.push(`${nombre}: ${(error as Error).message}`);
      }
    }

    expect(fallas).toEqual([]);
  });

  it("ninguno trae un color literal", () => {
    const hallazgos = COMPONENTES.flatMap(({ archivo }) => literalesDe(`${archivo}.tsx`, "color"));

    expect(hallazgos).toEqual([]);
  });

  it("los literales de tamaño de letra y radio son sólo los que aceptó la decisión 16", () => {
    // El preset escribe valores propios en el código de la herramienta: `text-[0.8rem]` y
    // `rounded-[min(var(--radius-md),10px)]` (10 y 12 px) en el botón, también en el selector,
    // `rounded-[4px]` en la casilla y `rounded-[2px]` en el tooltip. Germán decidió
    // (12/10/2026) tomar el código tal cual y dejar el código de la herramienta afuera del test
    // de CA-1, así que acá se fijan esos archivos: un literal nuevo en otro componente falla.
    const ACEPTADOS = ["button.tsx", "checkbox.tsx", "select.tsx", "tooltip.tsx"];

    const hallazgos = COMPONENTES.flatMap(({ archivo }) => [
      ...literalesDe(`${archivo}.tsx`, "tamaño"),
      ...literalesDe(`${archivo}.tsx`, "radio"),
    ]);
    const noAceptados = hallazgos.filter(
      (hallazgo) => !ACEPTADOS.some((aceptado) => hallazgo.startsWith(aceptado)),
    );

    expect(hallazgos.length, "los casos aceptados siguen ahí").toBeGreaterThan(0);
    expect(noAceptados).toEqual([]);
  });
});
