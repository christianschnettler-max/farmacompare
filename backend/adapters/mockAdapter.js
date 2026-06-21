// Adapter mock para farmacias cuya API aún no se ha confirmado.
// Retorna datos de ejemplo claramente marcados.

const MOCK_DB = {
  paracetamol: [
    {
      nombreProducto: "Paracetamol 500mg 20 comprimidos [DEMO]",
      principioActivo: "Paracetamol",
      precio: 1290,
      precioPromocion: null,
      tipo: "generico",
      stock: true,
      url: "#",
      imagen: null,
      laboratorio: "Lab. Demo",
    },
    {
      nombreProducto: "Tapsin Forte 500mg 20 comp [DEMO]",
      principioActivo: "Paracetamol",
      precio: 2990,
      precioPromocion: 2490,
      precioOriginal: 2990,
      tipo: "marca",
      stock: true,
      url: "#",
      imagen: null,
      laboratorio: "Lab. Demo Marca",
    },
  ],
  ibuprofeno: [
    {
      nombreProducto: "Ibuprofeno 400mg 20 comp [DEMO]",
      principioActivo: "Ibuprofeno",
      precio: 1890,
      precioPromocion: null,
      tipo: "generico",
      stock: true,
      url: "#",
      imagen: null,
      laboratorio: "Lab. Demo",
    },
  ],
};

function buscarEnMock(termino) {
  const t = termino.toLowerCase().trim();
  for (const [key, productos] of Object.entries(MOCK_DB)) {
    if (t.includes(key) || key.includes(t)) return productos;
  }
  // Resultado genérico si no hay coincidencia
  return [
    {
      nombreProducto: `${termino} 500mg [DEMO]`,
      principioActivo: termino,
      precio: Math.floor(Math.random() * 3000) + 1000,
      precioPromocion: null,
      tipo: "desconocido",
      stock: Math.random() > 0.3,
      url: "#",
      imagen: null,
      laboratorio: "Lab. Demo",
    },
  ];
}

export function crearAdapterMock(cfg) {
  return {
    nombre: cfg.nombre,
    logo: cfg.logo || null,
    esMock: true,
    async buscar(termino) {
      // Simular pequeña latencia
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200));
      return buscarEnMock(termino).map((p) => ({
        ...p,
        farmacia: cfg.nombre,
        logo: cfg.logo || null,
        nombreProducto: p.nombreProducto,
        esMock: true,
      }));
    },
  };
}
