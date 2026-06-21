import NodeCache from "node-cache";
import { farmacias } from "../adapters/index.js";
import { agruparPorPrincipioActivo } from "./principioActivo.js";

const cache = new NodeCache({ stdTTL: 6 * 3600, checkperiod: 600 });

export async function buscarEnTodas(termino) {
  const cacheKey = `buscar:${termino.toLowerCase().trim()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`[cache] hit: ${termino}`);
    return { ...cached, fromCache: true };
  }

  const resultados = await Promise.allSettled(farmacias.map((f) => f.buscar(termino)));

  const ok = [];
  const fallidas = [];
  const mocks = [];

  resultados.forEach((r, i) => {
    const f = farmacias[i];
    if (r.status === "fulfilled" && Array.isArray(r.value)) {
      ok.push(...r.value);
      if (f.esMock) mocks.push(f.nombre);
    } else {
      fallidas.push(f.nombre);
      console.warn(`[buscar] ${f.nombre} falló: ${r.reason?.message}`);
    }
  });

  ok.sort((a, b) => (a.precio || Infinity) - (b.precio || Infinity));

  const grupos = agruparPorPrincipioActivo(ok);
  const resultado = { resultados: ok, grupos, farmaciasSinRespuesta: fallidas, farmaciasMock: mocks };

  // Solo cachear si hay resultados reales (no solo mocks)
  const tieneReales = ok.some((r) => !r.esMock);
  if (tieneReales) cache.set(cacheKey, resultado);

  return resultado;
}

export function limpiarCache() {
  cache.flushAll();
}
