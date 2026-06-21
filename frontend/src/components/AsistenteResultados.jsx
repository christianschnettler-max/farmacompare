import { useState, useMemo } from "react";
import { CATALOGO_FARMACIAS } from "../data/farmacias.js";
import { abrirFarmacia } from "../services/api.js";

function formatearPrecio(n) {
  return "$" + Number(n).toLocaleString("es-CL");
}

export default function AsistenteResultados({ medicamentos, farmaciaIds }) {
  // precios[medicamento][farmaciaId] = número
  const [precios, setPrecios] = useState({});

  const farmacias = CATALOGO_FARMACIAS.filter((f) => farmaciaIds.includes(f.id));

  const setPrecio = (med, fid, valor) => {
    const num = parseInt(String(valor).replace(/[^\d]/g, ""), 10);
    setPrecios((prev) => ({
      ...prev,
      [med]: { ...(prev[med] || {}), [fid]: Number.isFinite(num) ? num : undefined },
    }));
  };

  const abrirTodas = (med) => {
    farmacias.forEach((f, i) => {
      // pequeño retraso para que el navegador no bloquee múltiples pestañas
      setTimeout(() => abrirFarmacia(f.buscarUrl(med)), i * 350);
    });
  };

  // Total por farmacia (suma de precios anotados de cada medicamento)
  const totales = useMemo(() => {
    const acc = {};
    for (const med of medicamentos) {
      const fila = precios[med] || {};
      for (const f of farmacias) {
        const p = fila[f.id];
        if (Number.isFinite(p)) {
          if (!acc[f.id]) acc[f.id] = { total: 0, cubiertos: 0 };
          acc[f.id].total += p;
          acc[f.id].cubiertos += 1;
        }
      }
    }
    return Object.entries(acc)
      .map(([id, v]) => ({
        nombre: CATALOGO_FARMACIAS.find((f) => f.id === id)?.nombre || id,
        ...v,
      }))
      .sort((a, b) => b.cubiertos - a.cubiertos || a.total - b.total);
  }, [precios, medicamentos, farmacias]);

  return (
    <div>
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
        <p className="text-blue-800 font-medium">
          👉 Para cada medicamento, abre las farmacias y mira el precio en su página oficial.
        </p>
        <p className="text-sm text-blue-600 mt-1">
          Si quieres comparar aquí, anota el precio que viste en cada una y la app te dirá cuál
          conviene. (Anotar es opcional.)
        </p>
      </div>

      {/* Comparación de totales (si se anotaron precios) */}
      {totales.length > 0 && medicamentos.length > 1 && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6">
          <h2 className="font-bold text-green-800 text-lg mb-2">🏆 ¿Dónde sale más barato todo?</h2>
          {totales.slice(0, 3).map((t, i) => (
            <div key={t.nombre} className="flex items-center justify-between text-sm py-0.5">
              <span className={i === 0 ? "font-bold text-green-800" : "text-gray-600"}>
                {i === 0 ? "⭐ " : ""}
                {t.nombre}
                <span className="text-gray-400 ml-1">
                  ({t.cubiertos}/{medicamentos.length})
                </span>
              </span>
              <span className={i === 0 ? "font-bold text-green-700 text-base" : "text-gray-600"}>
                {formatearPrecio(t.total)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Por cada medicamento */}
      {medicamentos.map((med) => {
        const fila = precios[med] || {};
        const valores = farmacias.map((f) => fila[f.id]).filter(Number.isFinite);
        const minimo = valores.length ? Math.min(...valores) : null;

        return (
          <section key={med} className="mb-8">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                💊 {med}
              </h3>
              <button
                onClick={() => abrirTodas(med)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl"
              >
                Abrir todas las farmacias →
              </button>
            </div>

            <div className="space-y-2">
              {farmacias.map((f) => {
                const precio = fila[f.id];
                const esMin = Number.isFinite(precio) && precio === minimo;
                return (
                  <div
                    key={f.id}
                    className={`flex items-center gap-3 bg-white border-2 rounded-xl p-3 ${
                      esMin ? "border-green-400" : "border-gray-100"
                    }`}
                  >
                    <span className="font-semibold text-gray-700 flex-1 min-w-0">
                      🏪 {f.nombre}
                      {esMin && (
                        <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                          ⭐ más barato
                        </span>
                      )}
                    </span>

                    {/* Campo opcional para anotar el precio */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span className="text-gray-400">$</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={Number.isFinite(precio) ? precio.toLocaleString("es-CL") : ""}
                        onChange={(e) => setPrecio(med, f.id, e.target.value)}
                        placeholder="precio"
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-right outline-none focus:border-blue-500"
                        aria-label={`Precio en ${f.nombre} para ${med}`}
                      />
                    </div>

                    <button
                      onClick={() => abrirFarmacia(f.buscarUrl(med))}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl flex-shrink-0"
                      aria-label={`Abrir ${f.nombre} y buscar ${med}`}
                    >
                      Ver precio →
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
