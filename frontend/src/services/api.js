// En Electron (archivo local) el backend corre en localhost:3791
// En web (dev o Netlify) usa rutas relativas /api/*
const BASE = window.location.protocol === "file:"
  ? "http://localhost:3791/api"
  : "/api";

export async function buscarMedicamento(termino) {
  const res = await fetch(`${BASE}/buscar?q=${encodeURIComponent(termino)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  return res.json();
}

export async function enviarMensajeIA(mensajes, contexto = null) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensajes, contexto }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Error ${res.status}`);
  }
  const data = await res.json();
  return data.respuesta;
}

export async function verificarSalud() {
  const res = await fetch(`${BASE}/health`);
  return res.json();
}
