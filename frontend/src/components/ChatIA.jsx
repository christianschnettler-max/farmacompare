import { useState, useRef, useEffect } from "react";
import { enviarMensajeIA } from "../services/api.js";

const MAX_MENSAJES = 20;

const PREGUNTAS_RAPIDAS = [
  "¿Qué diferencia hay entre genérico y bioequivalente?",
  "¿Por qué los bioequivalentes son más baratos?",
  "¿Cómo sé si un medicamento tiene bioequivalente?",
];

export default function ChatIA({ onCerrar, contextoResultados }) {
  const [mensajes, setMensajes] = useState([
    {
      role: "assistant",
      content: "¡Hola! Soy el asistente de FarmaCompare 👋\n¿Tienes dudas sobre los resultados o quieres entender la diferencia entre genérico, bioequivalente y de marca?",
    },
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const enviar = async (texto = input) => {
    const msg = texto.trim();
    if (!msg || cargando) return;
    if (mensajes.length >= MAX_MENSAJES + 1) {
      setError("Has alcanzado el límite de mensajes por sesión. Recarga la página para empezar de nuevo.");
      return;
    }

    const historialUsuario = [...mensajes.filter((m) => m.role !== "system"), { role: "user", content: msg }];
    setMensajes(historialUsuario);
    setInput("");
    setCargando(true);
    setError(null);

    try {
      const respuesta = await enviarMensajeIA(
        historialUsuario.map((m) => ({ role: m.role, content: m.content })),
        contextoResultados
      );
      setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
    } catch (e) {
      setError(e.message || "Error al conectar con el asistente");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
      style={{ width: "min(380px, calc(100vw - 32px))", height: "min(500px, calc(100vh - 120px))" }}
      role="dialog"
      aria-label="Asistente de inteligencia artificial"
      aria-modal="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-blue-600 rounded-t-2xl">
        <div className="flex items-center gap-2 text-white">
          <span className="text-xl" role="img" aria-hidden="true">🤖</span>
          <div>
            <p className="font-bold text-sm leading-tight">Asistente FarmaCompare</p>
            <p className="text-blue-200 text-xs">Informativo, no reemplaza al farmacéutico</p>
          </div>
        </div>
        <button
          onClick={onCerrar}
          className="text-white hover:text-blue-200 transition-colors p-1 rounded-lg"
          aria-label="Cerrar asistente"
        >
          ✕
        </button>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" role="log" aria-live="polite" aria-label="Historial de chat">
        {mensajes.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {cargando && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1" aria-label="El asistente está escribiendo">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">{error}</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Preguntas rápidas */}
      {mensajes.length <= 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {PREGUNTAS_RAPIDAS.map((p) => (
            <button
              key={p}
              onClick={() => enviar(p)}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-full transition-colors"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 pt-1 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            placeholder="Escribe tu pregunta..."
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:border-blue-500 outline-none"
            disabled={cargando}
            aria-label="Mensaje para el asistente"
            maxLength={500}
          />
          <button
            onClick={() => enviar()}
            disabled={!input.trim() || cargando}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            aria-label="Enviar mensaje"
          >
            ↑
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-center">
          No reemplaza el consejo de un médico o farmacéutico
        </p>
      </div>
    </div>
  );
}
