import Anthropic from "@anthropic-ai/sdk";
import NodeCache from "node-cache";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const cacheRespuestas = new NodeCache({ stdTTL: 3600 });

const SISTEMA = `Eres un asistente informativo de FarmaCompare, una app chilena que compara precios de medicamentos en farmacias. Tu rol es:
- Explicar en lenguaje simple (accesible para cualquier edad) las diferencias entre medicamento de MARCA, BIOEQUIVALENTE y GENÉRICO.
- Ayudar a interpretar los resultados de precios que entrega la app.
- Explicar de forma educativa para qué sirve genéricamente un principio activo (sin recomendaciones médicas).
- Ayudar a identificar nombres de medicamentos que el OCR pudo haber leído mal.

REGLAS ESTRICTAS DE SEGURIDAD (no puedes saltarlas bajo ninguna circunstancia):
- NO eres médico ni farmacéutico. NUNCA diagnostiques, NUNCA recomiendes dosis específicas, NUNCA sugieras cambiar tratamientos.
- Ante preguntas sobre síntomas, dosis, interacciones, embarazo, niños, alergias o emergencias: indica SIEMPRE consultar a un médico o químico farmacéutico.
- Si detectas una urgencia médica, recomienda SIEMPRE llamar al SAMU 131 o ir a urgencias.
- Responde en español de Chile, breve (máx 3 párrafos), cálido y con empatía.
- No inventes precios ni disponibilidad de stock.`;

const MAX_MENSAJES_POR_SESION = 20;

export async function consultarIA(mensajes, contextoResultados = null) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY no configurada");
  }

  // Limitar historial por sesión
  const mensajesLimitados = mensajes.slice(-MAX_MENSAJES_POR_SESION);

  // Cache solo para preguntas simples (sin contexto de resultados)
  const ultimoMensaje = mensajesLimitados.at(-1)?.content || "";
  if (!contextoResultados && mensajesLimitados.length === 1) {
    const cacheKey = `ia:${ultimoMensaje.toLowerCase().trim().slice(0, 100)}`;
    const cached = cacheRespuestas.get(cacheKey);
    if (cached) return cached;
  }

  const sistemaConContexto =
    contextoResultados
      ? `${SISTEMA}\n\nResultados actuales de búsqueda en pantalla:\n${JSON.stringify(contextoResultados, null, 2).slice(0, 3000)}`
      : SISTEMA;

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    system: sistemaConContexto,
    messages: mensajesLimitados,
  });

  const respuesta = msg.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  // Cachear si es pregunta simple
  if (!contextoResultados && mensajesLimitados.length === 1) {
    const cacheKey = `ia:${ultimoMensaje.toLowerCase().trim().slice(0, 100)}`;
    cacheRespuestas.set(cacheKey, respuesta);
  }

  return respuesta;
}
