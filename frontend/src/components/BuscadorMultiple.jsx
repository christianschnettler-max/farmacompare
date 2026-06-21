import { useState, useRef, useEffect } from "react";

const SUGERENCIAS = [
  "Paracetamol 500mg",
  "Ibuprofeno 400mg",
  "Omeprazol 20mg",
  "Loratadina 10mg",
  "Metformina 850mg",
];

export default function BuscadorMultiple({ onBuscar, medicamentosIniciales = [] }) {
  const [medicamentos, setMedicamentos] = useState(medicamentosIniciales);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const agregar = (texto) => {
    const t = texto.trim();
    if (t.length < 2) return;
    if (medicamentos.some((m) => m.toLowerCase() === t.toLowerCase())) {
      setInput("");
      return;
    }
    setMedicamentos((prev) => [...prev, t]);
    setInput("");
  };

  const quitar = (idx) => {
    setMedicamentos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (input.trim()) agregar(input);
      else if (medicamentos.length > 0) onBuscar(medicamentos);
    }
    // Borrar última etiqueta con backspace si el input está vacío
    if (e.key === "Backspace" && !input && medicamentos.length > 0) {
      quitar(medicamentos.length - 1);
    }
  };

  const buscar = () => {
    const lista = input.trim() ? [...medicamentos, input.trim()] : medicamentos;
    if (lista.length > 0) onBuscar(lista);
  };

  const totalParaBuscar = input.trim() ? medicamentos.length + 1 : medicamentos.length;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white shadow-lg rounded-2xl border-2 border-blue-200 focus-within:border-blue-500 transition-colors p-3">
        {/* Etiquetas de medicamentos agregados */}
        {medicamentos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Medicamentos a buscar">
            {medicamentos.map((m, idx) => (
              <span
                key={idx}
                role="listitem"
                className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 font-medium px-3 py-1.5 rounded-full text-base"
              >
                💊 {m}
                <button
                  onClick={() => quitar(idx)}
                  className="text-blue-400 hover:text-blue-700 font-bold"
                  aria-label={`Quitar ${m}`}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={medicamentos.length === 0 ? "Escribe un medicamento..." : "Agregar otro..."}
            className="flex-1 px-3 py-3 text-xl outline-none bg-transparent"
            aria-label="Nombre del medicamento"
            autoComplete="off"
          />
          {input.trim() && (
            <button
              onClick={() => agregar(input)}
              className="bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-3 py-2 rounded-xl transition-colors whitespace-nowrap"
              aria-label="Agregar este medicamento a la lista"
            >
              + Agregar
            </button>
          )}
        </div>
      </div>

      {/* Botón buscar */}
      <button
        onClick={buscar}
        disabled={totalParaBuscar === 0}
        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-2xl text-xl transition-colors flex items-center justify-center gap-2"
      >
        <span role="img" aria-hidden="true">🔍</span>
        {totalParaBuscar > 1
          ? `Comparar ${totalParaBuscar} medicamentos`
          : "Comparar precios"}
      </button>

      <p className="text-center text-sm text-gray-400 mt-2">
        Puedes agregar varios medicamentos y comparar todos de una vez
      </p>

      {/* Sugerencias rápidas */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        {SUGERENCIAS.map((s) => (
          <button
            key={s}
            onClick={() => agregar(s)}
            className="bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-sm px-3 py-1.5 rounded-full transition-colors"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}
