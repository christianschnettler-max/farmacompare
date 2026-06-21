import { useState, useCallback } from "react";
import BuscadorMultiple from "./components/BuscadorMultiple.jsx";
import SelectorFarmacias from "./components/SelectorFarmacias.jsx";
import ResultadosMultiple from "./components/ResultadosMultiple.jsx";
import SubirReceta from "./components/SubirReceta.jsx";
import Disclaimer from "./components/Disclaimer.jsx";
import { buscarPrecios, esAppEscritorio } from "./services/api.js";
import { FARMACIAS_DEFAULT } from "./data/farmacias.js";

export default function App() {
  const [vista, setVista] = useState("inicio"); // "inicio" | "resultados" | "receta"
  const [farmacias, setFarmacias] = useState(FARMACIAS_DEFAULT);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [textoGrande, setTextoGrande] = useState(false);

  const buscar = useCallback(
    async (medicamentos) => {
      if (!medicamentos?.length) return;
      if (farmacias.length === 0) {
        setError("Selecciona al menos una farmacia");
        return;
      }
      setCargando(true);
      setError(null);
      setVista("resultados");
      try {
        const resultado = await buscarPrecios(medicamentos, farmacias);
        setDatos(resultado);
      } catch (e) {
        setError(e.message || "Error al buscar. Intenta de nuevo.");
      } finally {
        setCargando(false);
      }
    },
    [farmacias]
  );

  const volverInicio = () => {
    setVista("inicio");
    setDatos(null);
    setError(null);
  };

  return (
    <div className={textoGrande ? "text-lg" : ""}>
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={volverInicio}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-90"
            aria-label="Ir al inicio"
          >
            <span className="text-2xl" aria-hidden="true">💊</span>
            <span>FarmaCompare</span>
          </button>
          <button
            onClick={() => setTextoGrande((v) => !v)}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-semibold"
            aria-label="Cambiar tamaño de texto"
          >
            {textoGrande ? "A−" : "A+"}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 pb-20">
        {vista === "inicio" && (
          <div className="animate-fade-in">
            <div className="text-center mb-6 mt-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Compara precios de medicamentos
              </h1>
              <p className="text-gray-500 text-lg">
                Busca uno o varios medicamentos y encuentra dónde están más baratos.
              </p>
              {!esAppEscritorio && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full">
                  ⚠️ Versión web: datos de demostración. La app de escritorio trae precios reales.
                </p>
              )}
            </div>

            <BuscadorMultiple onBuscar={buscar} />
            <SelectorFarmacias seleccionadas={farmacias} onCambio={setFarmacias} />

            <div className="mt-6 text-center">
              <button
                onClick={() => setVista("receta")}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl text-lg"
              >
                <span aria-hidden="true">📋</span> Subir receta médica
              </button>
            </div>

            {error && (
              <p className="text-center text-red-600 mt-4 font-medium" role="alert">{error}</p>
            )}
            <Disclaimer />
          </div>
        )}

        {vista === "receta" && (
          <div className="animate-fade-in">
            <button onClick={volverInicio} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
              ← Volver
            </button>
            <SubirReceta onBuscar={(meds) => buscar(Array.isArray(meds) ? meds : [meds])} />
          </div>
        )}

        {vista === "resultados" && (
          <div className="animate-fade-in">
            <button onClick={volverInicio} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
              ← Nueva búsqueda
            </button>
            <ResultadosMultiple datos={datos} cargando={cargando} error={error} />
          </div>
        )}
      </main>
    </div>
  );
}
