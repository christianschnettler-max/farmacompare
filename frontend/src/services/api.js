// Detecta si corre dentro de la app de escritorio (Electron con navegador real)
const enEscritorio = typeof window !== "undefined" && window.farmaApi?.esEscritorio;

const BASE = window.location.protocol === "file:" ? "http://localhost:3001/api" : "/api";

// Busca precios reales de varios medicamentos en varias farmacias.
// En escritorio usa el motor de navegador real; en web usa el backend (demo).
export async function buscarPrecios(medicamentos, farmaciaIds) {
  if (enEscritorio) {
    return window.farmaApi.buscarPrecios(medicamentos, farmaciaIds);
  }
  // Fallback web (demo): consulta el backend por cada medicamento
  const porMedicamento = [];
  for (const med of medicamentos) {
    try {
      const res = await fetch(`${BASE}/buscar?q=${encodeURIComponent(med)}`);
      const data = await res.json();
      porMedicamento.push({
        medicamento: med,
        resultados: data.resultados || [],
        farmaciasSinResultado: data.farmaciasSinRespuesta || [],
      });
    } catch {
      porMedicamento.push({ medicamento: med, resultados: [], farmaciasSinResultado: [] });
    }
  }
  return { porMedicamento };
}

export const esAppEscritorio = enEscritorio;
