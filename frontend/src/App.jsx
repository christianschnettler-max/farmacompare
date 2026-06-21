import { useState, useCallback } from "react";
import BuscadorMultiple from "./components/BuscadorMultiple.jsx";
import SelectorFarmacias from "./components/SelectorFarmacias.jsx";
import AsistenteResultados from "./components/AsistenteResultados.jsx";
import SubirReceta from "./components/SubirReceta.jsx";
import Disclaimer from "./components/Disclaimer.jsx";
import { FARMACIAS_DEFAULT } from "./data/farmacias.js";

export default function App() {
  const [vista, setVista] = useState("inicio"); // "inicio" | "resultados" | "receta"
  const [farmacias, setFarmacias] = useState(FARMACIAS_DEFAULT);
  const [medicamentos, setMedicamentos] = useState([]);
  const [error, setError] = useState(null);
  const [textoGrande, setTextoGrande] = useState(false);

  const buscar = useCallback(
    (meds) => {
      const lista = Array.isArray(meds) ? meds : [meds];
      if (!lista.length) return;
      if (farmacias.length === 0) {
        setError("Selecciona al menos una farmacia");
        return;
      }
      setError(null);
      setMedicamentos(lista);
      setVista("resultados");
    },
    [farmacias]
  );

  const volverInicio = () => {
    setVista("inicio");
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
                Busca uno o varios medicamentos y la app te abre cada farmacia con la búsqueda lista.
              </p>
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
            <SubirReceta onBuscar={buscar} />
          </div>
        )}

        {vista === "resultados" && (
          <div className="animate-fade-in">
            <button onClick={volverInicio} className="mb-4 text-blue-600 hover:text-blue-800 font-medium">
              ← Nueva búsqueda
            </button>
            <AsistenteResultados medicamentos={medicamentos} farmaciaIds={farmacias} />
          </div>
        )}
      </main>
    </div>
  );
}
