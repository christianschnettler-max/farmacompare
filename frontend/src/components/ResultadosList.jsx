import { useState, useMemo } from "react";
import TarjetaProducto from "./TarjetaProducto.jsx";

const TIPOS = ["todos", "generico", "bioequivalente", "marca"];
const FARMACIAS = ["Todas", "Salcobrand", "Cruz Verde", "Farmacias Ahumada", "Búho", "Meki"];

export default function ResultadosList({ datos, cargando, error, termino }) {
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroFarmacia, setFiltroFarmacia] = useState("Todas");
  const [ordenPrecio, setOrdenPrecio] = useState("asc");
  const [soloBioGenerico, setSoloBioGenerico] = useState(false);

  const resultados = datos?.resultados || [];
  const farmaciasFallidas = datos?.farmaciasSinRespuesta || [];
  const farmaciasMock = datos?.farmaciasMock || [];

  const filtrados = useMemo(() => {
    let r = [...resultados];
    if (filtroTipo !== "todos") r = r.filter((p) => p.tipo === filtroTipo);
    if (filtroFarmacia !== "Todas") r = r.filter((p) => p.farmacia === filtroFarmacia);
    if (soloBioGenerico) r = r.filter((p) => p.tipo === "generico" || p.tipo === "bioequivalente");
    r.sort((a, b) => ordenPrecio === "asc" ? a.precio - b.precio : b.precio - a.precio);
    return r;
  }, [resultados, filtroTipo, filtroFarmacia, ordenPrecio, soloBioGenerico]);

  const precioMinimo = filtrados.length > 0 ? filtrados[0].precio : null;

  if (cargando) {
    return (
      <div className="text-center py-16" role="status" aria-live="polite">
        <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" aria-hidden="true" />
        <p className="text-xl text-gray-600 font-medium">Buscando en todas las farmacias...</p>
        <p className="text-sm text-gray-400 mt-1">Esto puede tomar unos segundos</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center" role="alert">
        <p className="text-red-700 font-semibold text-lg">⚠️ {error}</p>
        <p className="text-red-500 text-sm mt-1">Verifica tu conexión o intenta nuevamente</p>
      </div>
    );
  }

  if (!datos) return null;

  return (
    <div>
      {/* Resumen */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-gray-800">
          {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""} para{" "}
          <span className="text-blue-600">"{termino}"</span>
        </h2>
        {datos.fromCache && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
            📦 Desde caché
          </span>
        )}
      </div>

      {/* Alertas de farmacias caídas o en modo demo */}
      {farmaciasFallidas.length > 0 && (
        <div className="mb-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-2 text-sm text-yellow-700" role="status">
          ⚠️ Sin respuesta: {farmaciasFallidas.join(", ")}
        </div>
      )}
      {farmaciasMock.length > 0 && (
        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700" role="status">
          ℹ️ Datos de demostración para: {farmaciasMock.join(", ")} — precios reales próximamente
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Tipo */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600" htmlFor="filtro-tipo">Tipo:</label>
            <select
              id="filtro-tipo"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t === "todos" ? "Todos" : t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Farmacia */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600" htmlFor="filtro-farmacia">Farmacia:</label>
            <select
              id="filtro-farmacia"
              value={filtroFarmacia}
              onChange={(e) => setFiltroFarmacia(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            >
              {FARMACIAS.map((f) => <option key={f}>{f}</option>)}
            </select>
          </div>

          {/* Orden */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600" htmlFor="orden-precio">Orden:</label>
            <select
              id="orden-precio"
              value={ordenPrecio}
              onChange={(e) => setOrdenPrecio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:border-blue-500 outline-none"
            >
              <option value="asc">Precio: menor a mayor</option>
              <option value="desc">Precio: mayor a menor</option>
            </select>
          </div>

          {/* Toggle bio/genérico */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={soloBioGenerico}
              onChange={(e) => setSoloBioGenerico(e.target.checked)}
              className="w-4 h-4 rounded accent-green-600"
            />
            <span className="text-sm font-medium text-gray-600">Solo bio/genérico</span>
          </label>
        </div>
      </div>

      {/* Lista de resultados */}
      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-5xl mb-3">🔍</p>
          <p className="text-lg font-medium">Sin resultados con estos filtros</p>
          <p className="text-sm mt-1">Prueba quitando algún filtro</p>
        </div>
      ) : (
        <div
          className="space-y-3"
          role="list"
          aria-label={`${filtrados.length} resultados de medicamentos`}
        >
          {filtrados.map((producto, idx) => (
            <TarjetaProducto
              key={`${producto.farmacia}-${producto.nombreProducto}-${idx}`}
              producto={producto}
              esMasBarato={producto.precio === precioMinimo}
            />
          ))}
        </div>
      )}
    </div>
  );
}
