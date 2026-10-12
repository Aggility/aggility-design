import { describe, expect, it } from "vitest";

describe("entorno de pruebas", () => {
  it("corre en un navegador simulado", () => {
    expect(typeof window).toBe("object");
    expect(document).toBeDefined();
  });
});
