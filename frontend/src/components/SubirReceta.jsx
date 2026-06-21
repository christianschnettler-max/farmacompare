import { useState, useRef } from "react";
import { extraerTextoDeImagen, extraerMedicamentosDeTexto } from "../services/ocr.js";

export default function SubirReceta({ onBuscar }) {
  const [fase, setFase] = useState("upload"); // "upload" | "procesando" | "editar" | "buscando"
  const [progreso, setProgreso] = useState(0);
  const [medicamentos, setMedicamentos] = useState([]);
  const [error, setError] = useState(null);
  const [resultadosPorMed, setResultadosPorMed] = useState({});
  const fileInputRef = useRef(null);
  const camaraRef = useRef(null);

  const procesarArchivo = async (archivo) => {
    setError(null);
    setFase("procesando");
    setProgreso(0);
    try {
      const texto = await extraerTextoDeImagen(archivo, setProgreso);
      const meds = extraerMedicamentosDeTexto(texto);
      if (meds.length === 0) {
        // Si no se detectaron con heurística, mostrar texto crudo para que el usuario edite
        setMedicamentos([texto.slice(0, 200)]);
      } else {
        setMedicamentos(meds);
      }
      setFase("editar");
    } catch (e) {
      setError("No se pudo procesar la imagen. Intenta con otra foto más nítida.");
      setFase("upload");
    }
  };

  const handleArchivo = (e) => {
    const f = e.target.files?.[0];
    if (f) procesarArchivo(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) procesarArchivo(f);
  };

  const actualizarMed = (idx, valor) => {
    setMedicamentos((prev) => prev.map((m, i) => (i === idx ? valor : m)));
  };

  const eliminarMed = (idx) => {
    setMedicamentos((prev) => prev.filter((_, i) => i !== idx));
  };

  const agregarMed = () => {
    setMedicamentos((prev) => [...prev, ""]);
  };

  const buscarTodos = () => {
    const validos = medicamentos.filter((m) => m.trim().length >= 2);
    if (validos.length === 0) return;
    setFase("buscando");
    onBuscar(validos); // busca todos juntos
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Subir receta médica</h2>
      <p className="text-gray-500 mb-6">
        Sube una foto o PDF de tu receta y la app detectará los medicamentos automáticamente.
        Podrás revisar y corregir la lista antes de buscar.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm" role="alert">
          ⚠️ {error}
        </div>
      )}

      {/* Zona de carga */}
      {fase === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-3 border-dashed border-blue-300 rounded-2xl p-8 text-center bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label="Zona para soltar archivos o hacer clic para seleccionar"
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        >
          <p className="text-5xl mb-3" role="img" aria-hidden="true">📄</p>
          <p className="text-xl font-semibold text-gray-700 mb-1">Arrastra tu receta aquí</p>
          <p className="text-gray-500 mb-4">o haz clic para seleccionar un archivo</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              📁 Seleccionar archivo
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                camaraRef.current?.click();
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              📷 Tomar foto
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">JPG, PNG, PDF • Máx. 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleArchivo}
            className="hidden"
            aria-label="Seleccionar imagen o PDF de receta"
          />
          <input
            ref={camaraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleArchivo}
            className="hidden"
            aria-label="Tomar foto de receta"
          />
        </div>
      )}

      {/* Procesando OCR */}
      {fase === "procesando" && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
          <p className="text-lg font-semibold text-gray-700">Analizando receta...</p>
          <div className="mt-4 max-w-xs mx-auto bg-gray-200 rounded-full h-3" role="progressbar" aria-valuenow={progreso} aria-valuemin={0} aria-valuemax={100}>
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 mt-2">{progreso}%</p>
        </div>
      )}

      {/* Editar medicamentos detectados */}
      {fase === "editar" && (
        <div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5" role="note">
            <p className="font-semibold text-amber-800">
              ✏️ Revisa y corrige los medicamentos detectados
            </p>
            <p className="text-sm text-amber-700 mt-1">
              El OCR puede cometer errores. Confirma cada nombre antes de buscar.
            </p>
          </div>

          <ul className="space-y-3 mb-5">
            {medicamentos.map((med, idx) => (
              <li key={idx} className="flex gap-2 items-center">
                <span className="text-gray-400 font-mono text-sm w-6 text-right flex-shrink-0">{idx + 1}.</span>
                <input
                  type="text"
                  value={med}
                  onChange={(e) => actualizarMed(idx, e.target.value)}
                  className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-xl px-4 py-2.5 text-base outline-none"
                  aria-label={`Medicamento ${idx + 1}`}
                />
                <button
                  onClick={() => eliminarMed(idx)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label={`Eliminar medicamento ${idx + 1}`}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={agregarMed}
              className="border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500 hover:text-blue-600 font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              + Agregar medicamento
            </button>
            <button
              onClick={() => setFase("upload")}
              className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              Subir otra receta
            </button>
            <button
              onClick={buscarTodos}
              disabled={medicamentos.filter((m) => m.trim().length >= 2).length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-6 py-2.5 rounded-xl transition-colors ml-auto"
            >
              🔍 Buscar {medicamentos.filter((m) => m.trim().length >= 2).length} medicamento{medicamentos.filter((m) => m.trim().length >= 2).length !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {fase === "buscando" && (
        <div className="text-center py-12" role="status" aria-live="polite">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
          <p className="text-lg font-semibold text-gray-700">Buscando precios de todos los medicamentos...</p>
        </div>
      )}
    </div>
  );
}
