import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * El anillo de foco que el bloque le da a un control: el grosor y el color del sistema
 * (`--ring`). Acá se comprueban las clases, porque jsdom no aplica la hoja de estilos: el
 * anillo dibujado lo mide Playwright en `e2e/teclado-armazon.spec.ts`.
 */
const ANILLO = /focus-visible:ring-3/;
const ANILLO_DEL_SISTEMA = /focus-visible:ring-ring\/50/;

/** Los controles de la sección 5.4, en el orden en que se recorren con Tab. */
const CONTROLES = ["Guardar cliente", "Acepto los términos", "Fuente", "Abrir el diálogo", "Abrir el cajón", "Abrir el menú", "Con tooltip"];

/** Los que se abren con Enter y se cierran con Escape, con el rol con el que se muestran. */
const DESPLEGABLES = [
  { nombre: "Abrir el diálogo", rol: "dialog" },
  { nombre: "Abrir el cajón", rol: "dialog" },
  { nombre: "Abrir el menú", rol: "menu" },
];

function Pantalla({ alGuardar }: { alGuardar?: () => void } = {}) {
  return (
    <TooltipProvider>
      <Button onClick={alGuardar}>Guardar cliente</Button>
      <Checkbox aria-label="Acepto los términos" />
      <Select defaultValue="meta">
        <SelectTrigger aria-label="Fuente">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="meta">Meta</SelectItem>
          <SelectItem value="google">Google Ads</SelectItem>
          <SelectItem value="ga4">GA4</SelectItem>
        </SelectContent>
      </Select>
      <Dialog>
        <DialogTrigger render={<Button variant="outline">Abrir el diálogo</Button>} />
        <DialogContent>
          <DialogTitle>Nuevo cliente</DialogTitle>
        </DialogContent>
      </Dialog>
      <Sheet>
        <SheetTrigger render={<Button variant="outline">Abrir el cajón</Button>} />
        <SheetContent>
          <SheetTitle>Filtros</SheetTitle>
        </SheetContent>
      </Sheet>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline">Abrir el menú</Button>} />
        <DropdownMenuContent>
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Salir</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<Button variant="ghost">Con tooltip</Button>} />
        <TooltipContent>Últimos 30 días</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** El nombre accesible de lo que tiene el foco ahora. */
function enfocado(): string {
  const activo = (document.activeElement ?? document.body) as HTMLElement;

  return activo.getAttribute("aria-label") ?? activo.textContent?.trim() ?? "";
}

describe("los componentes base con teclado (CA-8)", () => {
  // Sin globals en Vitest, Testing Library no limpia sola: se limpia acá para que cada caso
  // arranque con una sola pantalla montada.
  afterEach(cleanup);

  it("cada control recibe el foco con Tab, en orden, y trae el anillo del sistema", async () => {
    const usuario = userEvent.setup();

    render(<Pantalla />);

    const recorrido: string[] = [];

    for (let intento = 0; intento < CONTROLES.length; intento += 1) {
      await usuario.tab();

      const nombre = enfocado();
      expect(nombre, `el paso ${intento + 1} del recorrido tiene que caer en un control`).not.toBe("");

      const clases = (document.activeElement as HTMLElement).className;
      expect(clases, `"${nombre}" tiene que traer el anillo de foco`).toMatch(ANILLO);
      expect(clases, `y el anillo de "${nombre}" tiene que ser el del sistema`).toMatch(ANILLO_DEL_SISTEMA);
      recorrido.push(nombre);
    }

    expect(recorrido).toEqual(CONTROLES);
  });

  it("el botón se activa con Enter y con Espacio, y la casilla con Espacio", async () => {
    const usuario = userEvent.setup();
    const alGuardar = vi.fn();

    render(<Pantalla alGuardar={alGuardar} />);

    const boton = screen.getByRole("button", { name: "Guardar cliente" });
    boton.focus();

    await usuario.keyboard("{Enter}");
    await usuario.keyboard(" ");
    expect(alGuardar, "el botón responde a Enter y a Espacio").toHaveBeenCalledTimes(2);

    const casilla = screen.getByRole("checkbox", { name: "Acepto los términos" });
    casilla.focus();
    expect(casilla.getAttribute("aria-checked")).toBe("false");

    await usuario.keyboard(" ");
    expect(casilla.getAttribute("aria-checked"), "la casilla se marca con Espacio").toBe("true");

    await usuario.keyboard(" ");
    expect(casilla.getAttribute("aria-checked"), "y se desmarca con Espacio").toBe("false");
  });

  it("el diálogo, el cajón y el menú se abren con Enter, se cierran con Escape y devuelven el foco", async () => {
    const usuario = userEvent.setup();

    render(<Pantalla />);

    for (const { nombre, rol } of DESPLEGABLES) {
      const disparador = screen.getByRole("button", { name: nombre });
      disparador.focus();
      await usuario.keyboard("{Enter}");

      expect(await screen.findByRole(rol), `${nombre} se abre con Enter`).toBeTruthy();

      await usuario.keyboard("{Escape}");

      await waitFor(() => expect(screen.queryByRole(rol), `${nombre} se cierra con Escape`).toBeNull());
      expect(enfocado(), `${nombre} devuelve el foco al control que lo abrió`).toBe(nombre);
    }
  });

  it("las flechas abren el selector y Enter elige la opción", async () => {
    const usuario = userEvent.setup();

    render(<Pantalla />);

    // El recorrido del menú con flechas se verifica en el navegador
    // (`e2e/teclado-armazon.spec.ts`): jsdom no mueve el foco dentro del popup de forma
    // confiable, así que acá queda lo que sí es estable.
    const selector = screen.getByRole("combobox", { name: "Fuente" });
    expect(selector.textContent, "arranca con la opción elegida").toContain("meta");

    selector.focus();
    await usuario.keyboard("{ArrowDown}");
    expect(await screen.findByRole("listbox"), "la flecha abre las opciones").toBeTruthy();

    await usuario.keyboard("{ArrowDown}");
    await usuario.keyboard("{Enter}");

    await waitFor(() =>
      expect(selector.textContent, "las flechas y Enter cambian la opción elegida").toContain("google"),
    );
  });
});
