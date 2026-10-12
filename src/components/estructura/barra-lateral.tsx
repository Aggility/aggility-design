"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

import { GRUPOS, USUARIO, seccionDeLaRuta, type GrupoDeSecciones } from "@/components/estructura/secciones";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import logoNegativo from "../../../sistema/logos/logo-full-negativo.webp";
import logoPositivo from "../../../sistema/logos/logo-full-positivo.webp";

/** El ancla del grupo para que su título lo nombre (`role="group"` + `aria-labelledby`). */
function anclaDe(grupo: GrupoDeSecciones): string {
  const sinTildes = grupo.titulo.normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return `grupo-${sinTildes.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

/** Las iniciales de un nombre, para el avatar de ejemplo. */
function inicialesDe(nombre: string): string {
  return nombre
    .split(" ")
    .map((palabra) => palabra.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * El botón de menú de las pantallas angostas: abre y cierra el cajón. Vive acá porque es
 * parte del comportamiento angosto de la barra, y el encabezado lo pone donde va.
 */
export function BotonDeMenu({ className }: { className?: string }) {
  return <SidebarTrigger aria-label="Menú de secciones" className={cn("md:hidden", className)} />;
}

/**
 * La barra lateral: el logo arriba, las secciones agrupadas con la actual destacada y el
 * menú del usuario abajo. En pantallas angostas es el cajón del mismo bloque.
 */
export function BarraLateral() {
  const ruta = usePathname();
  const actual = seccionDeLaRuta(ruta);
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <div className="flex h-10 items-center px-2">
          {/* Un logo por modo: la guía dice cuál va sobre fondo claro y cuál sobre oscuro. */}
          <Image src={logoPositivo} alt="Aggility" className="h-6 w-auto dark:hidden" />
          <Image src={logoNegativo} alt="Aggility" className="hidden h-6 w-auto dark:block" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav aria-label="Secciones" className="flex flex-col">
          {GRUPOS.map((grupo, indice) => (
            <Fragment key={grupo.titulo}>
              {indice > 0 ? <SidebarSeparator /> : null}
              <SidebarGroup role="group" aria-labelledby={anclaDe(grupo)}>
                <SidebarGroupLabel id={anclaDe(grupo)}>{grupo.titulo}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {grupo.secciones.map((seccion) => {
                      const esLaActual = seccion.href === actual?.href;

                      return (
                        <SidebarMenuItem key={seccion.href}>
                          <SidebarMenuButton
                            isActive={esLaActual}
                            // La guía pide el ítem activo en `primary-soft` con el texto en
                            // `foreground`: estas clases pisan las del bloque generado.
                            className="data-active:bg-primary-soft data-active:text-foreground"
                            render={
                              <Link
                                href={seccion.href}
                                aria-current={esLaActual ? "page" : undefined}
                                // Elegir una sección cierra el cajón de las pantallas angostas.
                                onClick={() => setOpenMobile(false)}
                              />
                            }
                          >
                            <seccion.Icono aria-hidden="true" />
                            <span>{seccion.titulo}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </Fragment>
          ))}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`Menú de ${USUARIO.nombre}`}
                render={<SidebarMenuButton size="lg" />}
              >
                <Avatar>
                  <AvatarFallback>{inicialesDe(USUARIO.nombre)}</AvatarFallback>
                </Avatar>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-body-strong">{USUARIO.nombre}</span>
                  <span className="truncate text-small text-muted-foreground">{USUARIO.rol}</span>
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56">
                <DropdownMenuLabel>
                  <span className="flex flex-col">
                    <span className="text-body-strong">{USUARIO.nombre}</span>
                    <span className="text-small text-muted-foreground">{USUARIO.rol}</span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href="/ingreso" />}>Cerrar sesión</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
