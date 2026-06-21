import { useMemo } from "react";
import TarjetaProducto from "./TarjetaProducto.jsx";

function formatearPrecio(n) {
  if (!n && n !== 0) return "—";
  return "$" + n.toLocaleString("es-CL");
}

// Calcula el costo total por farmacia (comprando el más barato de cada medicamento)
function calcularTotalesPorFarmacia(porMedicamento) {
  const farmacias = {};
  for (const grupo of porMedicamento) {
    // mejor precio de cada farmacia para este medicamento
    const mejorPorFarmacia = {};
    for (const r of grupo.resultados) {
      if (!mejorPorFarmacia[r.farmacia] || r.precio < mejorPorFarmacia[r.farmacia]) {
        mejorPorFarmacia[r.farmacia] = r.precio;
      }
    }
    for (const [farmacia, precio] of Object.entries(mejorPorFarmacia)) {
      if (!farmacias[farmacia]) farmacias[farmacia] = { total: 0, cubiertos: 0 };
      farmacias[farmacia].total += precio;
      farmacias[farmacia].cubiertos += 1;
    }
  }
  return Object.entries(farmacias)
    .map(([farmacia, { total, cubiertos }]) => ({ farmacia, total, cubiertos }))
    .sort((a, b) => b.cubiertos - a.cubiertos || a.total - b.total);
}

export default function ResultadosMultiple({ datos, cargando, error }) {
  const porMedicamento = datos?.porMedicamento || [];
  const totales = useMemo(() => calcularTotalesPorFarmacia(porMedicamento), [porMedicamento]);
  const totalMedicamentos = porMedicamento.length;

  if (cargando) {
    return (
      <div className="text-center py-16" role="status" aria-live="polite">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-xl text-gray-600 font-medium">Buscando en las farmacias...</p>
        <p className="text-sm text-gray-400 mt-1">Abriendo cada sitio y leyendo los precios reales. Puede tardar un momento.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center" role="alert">
        <p className="text-red-700 font-semibold text-lg">⚠️ {error}</p>
      </div>
    );
  }

  if (!datos) return null;

  const hayResultados = porMedicamento.some((g) => g.resultados.length > 0);

  return (
    <div>
      {/* Resumen: farmacia más conveniente para comprar todo */}
      {totalMedicamentos > 1 && totales.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
          <h2 className="font-bold text-green-800 text-lg mb-2">
            🏆 ¿Dónde comprar todo más barato?
          </h2>
          <div className="space-y-1">
            {totales.slice(0, 3).map((t, i) => (
              <div key={t.farmacia} className="flex items-center justify-between text-sm">
                <span className={i === 0 ? "font-bold text-green-800" : "text-gray-600"}>
                  {i === 0 ? "⭐ " : ""}{t.farmacia}
                  <span className="text-gray-400 ml-1">
                    ({t.cubiertos}/{totalMedicamentos} medicamentos)
                  </span>
                </span>
                <span className={i === 0 ? "font-bold text-green-700 text-base" : "text-gray-600"}>
                  {formatearPrecio(t.total)}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-green-600 mt-2">
            Total estimado comprando el más barato de cada medicamento en esa farmacia.
          </p>
        </div>
      )}

      {!hayResultados && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-lg font-medium">No se encontraron precios</p>
          <p className="text-sm mt-1">Intenta con otro nombre o revisa la ortografía del medicamento</p>
        </div>
      )}

      {/* Resultados por cada medicamento */}
      {porMedicamento.map((grupo) => {
        const precioMin = grupo.resultados[0]?.precio;
        return (
          <section key={grupo.medicamento} className="mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              💊 {grupo.medicamento}
              <span className="text-sm font-normal text-gray-400">
                ({grupo.resultados.length} resultado{grupo.resultados.length !== 1 ? "s" : ""})
              </span>
            </h3>

            {grupo.farmaciasSinResultado?.length > 0 && (
              <p className="text-xs text-amber-600 mb-2">
                Sin resultados en: {grupo.farmaciasSinResultado.join(", ")}
              </p>
            )}

            {grupo.resultados.length === 0 ? (
              <p className="text-gray-400 text-sm py-3">No se encontró este medicamento.</p>
            ) : (
              <div className="space-y-3" role="list">
                {grupo.resultados.map((producto, idx) => (
                  <TarjetaProducto
                    key={`${producto.farmacia}-${idx}`}
                    producto={producto}
                    esMasBarato={producto.precio === precioMin}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
