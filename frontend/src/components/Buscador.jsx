import { useState, useEffect, useRef } from "react";

const SUGERENCIAS = [
  "Paracetamol 500mg",
  "Ibuprofeno 400mg",
  "Amoxicilina 500mg",
  "Omeprazol 20mg",
  "Loratadina 10mg",
  "Metformina 850mg",
  "Atorvastatina 20mg",
];

export default function Buscador({ onBuscar, grande, compacto, terminoInicial = "" }) {
  const [valor, setValor] = useState(terminoInicial);
  const inputRef = useRef(null);

  useEffect(() => {
    if (grande && inputRef.current) inputRef.current.focus();
  }, [grande]);

  const handleSubmit = () => {
    const t = valor.trim();
    if (t.length >= 2) onBuscar(t);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  if (compacto) {
    return (
      <div className="flex gap-2 flex-1">
        <input
          ref={inputRef}
          type="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Buscar otro medicamento..."
          className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-2 text-base focus:border-blue-500 outline-none"
          aria-label="Buscar medicamento"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
          aria-label="Buscar"
        >
          🔍
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex gap-2 shadow-lg rounded-2xl overflow-hidden border-2 border-blue-200 focus-within:border-blue-500 transition-colors bg-white">
        <input
          ref={inputRef}
          type="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Escribe el nombre del medicamento..."
          className="flex-1 px-5 py-4 text-xl outline-none bg-transparent"
          aria-label="Nombre del medicamento a buscar"
          autoComplete="off"
        />
        <button
          onClick={handleSubmit}
          disabled={valor.trim().length < 2}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-6 py-4 text-lg transition-colors flex items-center gap-2"
          aria-label="Buscar medicamento"
        >
          <span role="img" aria-hidden="true">🔍</span>
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>

      {/* Sugerencias rápidas */}
      {grande && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center" role="list" aria-label="Búsquedas frecuentes">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              role="listitem"
              onClick={() => { setValor(s); onBuscar(s); }}
              className="bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-700 text-sm px-3 py-1.5 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
