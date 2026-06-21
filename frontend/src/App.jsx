import { useState, useCallback } from "react";
import Buscador from "./components/Buscador.jsx";
import ResultadosList from "./components/ResultadosList.jsx";
import SubirReceta from "./components/SubirReceta.jsx";
import Disclaimer from "./components/Disclaimer.jsx";
import { buscarMedicamento } from "./services/api.js";

export default function App() {
  const [vista, setVista] = useState("inicio"); // "inicio" | "resultados" | "receta"
  const [terminoBusqueda, setTerminoBusqueda] = useState("");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [textoGrande, setTextoGrande] = useState(false);

  const buscar = useCallback(async (termino) => {
    if (!termino?.trim()) return;
    setCargando(true);
    setError(null);
    setTerminoBusqueda(termino);
    setVista("resultados");
    try {
      const resultado = await buscarMedicamento(termino);
      setDatos(resultado);
    } catch (e) {
      setError(e.message || "Error al buscar. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }, []);

  const volverInicio = () => {
    setVista("inicio");
    setDatos(null);
    setError(null);
    setTerminoBusqueda("");
  };

  return (
    <div className={textoGrande ? "text-lg" : ""}>
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={volverInicio}
            className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity"
            aria-label="Ir al inicio de FarmaCompare"
          >
            <span className="text-2xl" role="img" aria-hidden="true">💊</span>
            <span>FarmaCompare</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTextoGrande((v) => !v)}
              className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-semibold"
              aria-label={textoGrande ? "Reducir tamaño de texto" : "Aumentar tamaño de texto"}
              title="Cambiar tamaño de texto"
            >
              {textoGrande ? "A−" : "A+"}
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-32">
        {vista === "inicio" && (
          <div className="animate-fade-in">
            <div className="text-center mb-8 mt-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Compara precios de medicamentos
              </h1>
              <p className="text-gray-500 text-lg">
                Encuentra el precio más bajo en Salcobrand, Cruz Verde, Ahumada y más.
              </p>
            </div>
            <Buscador onBuscar={buscar} grande />
            <div className="mt-6 text-center">
              <button
                onClick={() => setVista("receta")}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl text-lg transition-colors shadow-sm"
                aria-label="Subir foto o PDF de tu receta médica"
              >
                <span role="img" aria-hidden="true">📋</span>
                Subir receta médica
              </button>
              <p className="text-sm text-gray-400 mt-2">
                Sube una foto o PDF y comparamos toda tu receta de una vez
              </p>
            </div>
            <Disclaimer />
          </div>
        )}

        {vista === "receta" && (
          <div className="animate-fade-in">
            <button
              onClick={volverInicio}
              className="mb-4 flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver
            </button>
            <SubirReceta onBuscar={buscar} onBuscarVarios={(lista) => lista.forEach(buscar)} />
          </div>
        )}

        {vista === "resultados" && (
          <div className="animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <button
                onClick={volverInicio}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Volver
              </button>
              <Buscador onBuscar={buscar} terminoInicial={terminoBusqueda} compacto />
            </div>
            <ResultadosList
              datos={datos}
              cargando={cargando}
              error={error}
              termino={terminoBusqueda}
            />
          </div>
        )}
      </main>

    </div>
  );
}
