import { test, describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── Tests del adapter mock ───────────────────────────────────────────────────
describe("crearAdapterMock", async () => {
  const { crearAdapterMock } = await import("../adapters/mockAdapter.js");

  it("devuelve array de resultados para paracetamol", async () => {
    const adapter = crearAdapterMock({ nombre: "TestFarmacia" });
    const resultados = await adapter.buscar("paracetamol");
    assert.ok(Array.isArray(resultados), "debe devolver array");
    assert.ok(resultados.length > 0, "debe tener al menos un resultado");
  });

  it("cada resultado tiene los campos obligatorios", async () => {
    const adapter = crearAdapterMock({ nombre: "TestFarmacia" });
    const resultados = await adapter.buscar("ibuprofeno");
    const camposRequeridos = ["farmacia", "nombreProducto", "precio", "tipo", "stock", "url"];
    for (const r of resultados) {
      for (const campo of camposRequeridos) {
        assert.ok(campo in r, `falta campo: ${campo}`);
      }
    }
  });

  it("el tipo es uno de los valores válidos", async () => {
    const adapter = crearAdapterMock({ nombre: "TestFarmacia" });
    const resultados = await adapter.buscar("paracetamol");
    const tiposValidos = ["generico", "bioequivalente", "marca", "desconocido"];
    for (const r of resultados) {
      assert.ok(tiposValidos.includes(r.tipo), `tipo inválido: ${r.tipo}`);
    }
  });

  it("el precio es un número positivo", async () => {
    const adapter = crearAdapterMock({ nombre: "TestFarmacia" });
    const resultados = await adapter.buscar("paracetamol");
    for (const r of resultados) {
      assert.ok(typeof r.precio === "number", "precio debe ser número");
      assert.ok(r.precio > 0, "precio debe ser positivo");
    }
  });
});

// ─── Tests del servicio de principio activo ───────────────────────────────────
describe("normalizarPrincipioActivo", async () => {
  const { normalizarPrincipioActivo, agruparPorPrincipioActivo } = await import("../services/principioActivo.js");

  it("normaliza paracetamol y tapsin al mismo principio activo", () => {
    const pa1 = normalizarPrincipioActivo("Paracetamol 500mg");
    const pa2 = normalizarPrincipioActivo("Tapsin Forte 500mg");
    assert.equal(pa1, pa2, "deben mapearse al mismo principio activo");
  });

  it("agrupa productos del mismo principio activo", () => {
    const productos = [
      { nombreProducto: "Paracetamol 500mg", principioActivo: "Paracetamol", precio: 1200, tipo: "generico" },
      { nombreProducto: "Tapsin 500mg", principioActivo: "Tapsin", precio: 2500, tipo: "marca" },
    ];
    const grupos = agruparPorPrincipioActivo(productos);
    assert.ok(grupos.length >= 1, "debe haber al menos un grupo");
    const grupo = grupos.find((g) => g.principioActivo === "paracetamol");
    assert.ok(grupo, "debe existir grupo de paracetamol");
    assert.equal(grupo.productos.length, 2, "debe agrupar ambos productos");
  });

  it("el más barato del grupo está primero", () => {
    const productos = [
      { nombreProducto: "Ibuprofeno Caro", principioActivo: "Ibuprofeno", precio: 3000, tipo: "marca" },
      { nombreProducto: "Ibuprofeno Barato", principioActivo: "Ibuprofeno", precio: 1000, tipo: "generico" },
    ];
    const grupos = agruparPorPrincipioActivo(productos);
    const grupo = grupos[0];
    assert.equal(grupo.productos[0].precio, 1000, "el más barato debe ir primero");
    assert.equal(grupo.masBarato.precio, 1000);
  });
});

// ─── Tests del servicio de búsqueda ──────────────────────────────────────────
describe("buscarEnTodas (con mocks)", async () => {
  // Sobreescribir adapters para test
  process.env.ANTHROPIC_API_KEY = "sk-test-dummy";
  const { buscarEnTodas } = await import("../services/buscar.js");

  it("devuelve estructura correcta", async () => {
    const resultado = await buscarEnTodas("paracetamol");
    assert.ok("resultados" in resultado, "debe tener campo resultados");
    assert.ok("farmaciasSinRespuesta" in resultado, "debe tener campo farmaciasSinRespuesta");
    assert.ok(Array.isArray(resultado.resultados));
    assert.ok(Array.isArray(resultado.farmaciasSinRespuesta));
  });

  it("los resultados están ordenados por precio ascendente", async () => {
    const resultado = await buscarEnTodas("paracetamol");
    const precios = resultado.resultados.map((r) => r.precio);
    for (let i = 1; i < precios.length; i++) {
      assert.ok(precios[i] >= precios[i - 1], "resultados deben estar ordenados por precio");
    }
  });
});
