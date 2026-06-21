import { useState } from "react";
import { CATALOGO_FARMACIAS } from "../data/farmacias.js";

export default function SelectorFarmacias({ seleccionadas, onCambio }) {
  const [abierto, setAbierto] = useState(false);

  const toggle = (id) => {
    if (seleccionadas.includes(id)) {
      onCambio(seleccionadas.filter((x) => x !== id));
    } else {
      onCambio([...seleccionadas, id]);
    }
  };

  const nombresSeleccionados = CATALOGO_FARMACIAS
    .filter((f) => seleccionadas.includes(f.id))
    .map((f) => f.nombre);

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between bg-white border-2 border-gray-200 hover:border-blue-300 rounded-xl px-4 py-3 transition-colors"
        aria-expanded={abierto}
      >
        <span className="text-gray-700 font-medium text-left">
          🏪 Farmacias a comparar:{" "}
          <span className="text-blue-600 font-bold">{seleccionadas.length}</span>
          <span className="text-gray-400 text-sm block sm:inline sm:ml-1">
            ({nombresSeleccionados.slice(0, 3).join(", ")}
            {nombresSeleccionados.length > 3 ? `, +${nombresSeleccionados.length - 3}` : ""})
          </span>
        </span>
        <span className="text-gray-400 text-xl">{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div className="mt-2 bg-white border-2 border-gray-100 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
          {CATALOGO_FARMACIAS.map((f) => {
            const activa = seleccionadas.includes(f.id);
            return (
              <label
                key={f.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  activa ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-transparent hover:bg-gray-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={() => toggle(f.id)}
                  className="w-5 h-5 rounded accent-blue-600 flex-shrink-0"
                  aria-label={`Comparar en ${f.nombre}`}
                />
                <span className={`font-medium ${activa ? "text-blue-800" : "text-gray-600"}`}>
                  {f.nombre}
                </span>
                {f.default && (
                  <span className="ml-auto text-xs text-gray-400">principal</span>
                )}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
