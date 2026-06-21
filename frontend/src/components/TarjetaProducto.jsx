const TIPO_CONFIG = {
  generico:       { label: "Genérico",       bg: "bg-green-100",  text: "text-green-800",  border: "border-green-200" },
  bioequivalente: { label: "Bioequivalente", bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  marca:          { label: "De Marca",       bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-200" },
  desconocido:    { label: "Sin clasificar", bg: "bg-gray-100",   text: "text-gray-600",   border: "border-gray-200" },
};

function formatearPrecio(n) {
  if (!n && n !== 0) return "—";
  return "$" + n.toLocaleString("es-CL");
}

export default function TarjetaProducto({ producto, esMasBarato }) {
  const tipo = TIPO_CONFIG[producto.tipo] || TIPO_CONFIG.desconocido;

  return (
    <article
      role="listitem"
      className={`bg-white rounded-2xl border-2 transition-all animate-fade-in ${
        esMasBarato ? "border-green-400 shadow-md shadow-green-100" : "border-gray-100 hover:border-gray-200 hover:shadow-sm"
      }`}
      aria-label={`${producto.nombreProducto} en ${producto.farmacia}: ${formatearPrecio(producto.precio)}`}
    >
      <div className="p-4 flex gap-4">
        {/* Imagen del producto */}
        <div className="flex-shrink-0">
          {producto.imagen ? (
            <img
              src={producto.imagen}
              alt={producto.nombreProducto}
              className="w-16 h-16 object-contain rounded-lg bg-gray-50 border border-gray-100"
              loading="lazy"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-3xl" aria-hidden="true">
              💊
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              {/* Etiqueta más barato */}
              {esMasBarato && (
                <div className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                  ⭐ MÁS BARATO
                </div>
              )}
              {producto.esMock && (
                <div className="inline-flex items-center gap-1 bg-gray-200 text-gray-500 text-xs px-2 py-0.5 rounded-full mb-1 ml-1">
                  DEMO
                </div>
              )}
              <h3 className="font-bold text-gray-800 text-base leading-tight">
                {producto.nombreProducto}
              </h3>
              {producto.principioActivo && producto.principioActivo !== producto.nombreProducto && (
                <p className="text-sm text-gray-500 mt-0.5">
                  Principio activo: {producto.principioActivo}
                </p>
              )}
              {producto.laboratorio && (
                <p className="text-xs text-gray-400">{producto.laboratorio}</p>
              )}
            </div>

            {/* Precio */}
            <div className="text-right flex-shrink-0">
              {producto.precioPromocion && producto.precioOriginal ? (
                <>
                  <p className="text-2xl font-bold text-green-600">
                    {formatearPrecio(producto.precioPromocion)}
                  </p>
                  <p className="text-sm text-gray-400 line-through">
                    {formatearPrecio(producto.precioOriginal)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-800">
                  {formatearPrecio(producto.precio)}
                </p>
              )}
              <p className="text-xs text-gray-400">CLP</p>
            </div>
          </div>

          {/* Tags y acciones */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              {/* Tipo */}
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tipo.bg} ${tipo.text} ${tipo.border}`}>
                {tipo.label}
              </span>
              {/* Farmacia */}
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                🏪 {producto.farmacia}
              </span>
              {/* Stock */}
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                producto.stock === true
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : producto.stock === false
                  ? "bg-red-50 text-red-600 border-red-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}>
                {producto.stock === true ? "✓ En stock" : producto.stock === false ? "✗ Sin stock" : "Stock desconocido"}
              </span>
            </div>

            {/* Botón comprar */}
            {producto.url && producto.url !== "#" ? (
              <a
                href={producto.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors"
                aria-label={`Ir a comprar ${producto.nombreProducto} en ${producto.farmacia}`}
              >
                Ir a comprar →
              </a>
            ) : (
              <span className="flex-shrink-0 bg-gray-200 text-gray-400 text-sm px-4 py-2 rounded-xl cursor-not-allowed">
                Demo
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
