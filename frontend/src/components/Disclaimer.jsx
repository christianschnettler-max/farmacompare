export default function Disclaimer() {
  return (
    <div className="mt-10 bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-800" role="note">
      <p className="font-bold text-base mb-1">⚠️ Aviso importante</p>
      <p>
        FarmaCompare es una herramienta <strong>informativa</strong>. Los precios pueden variar y no
        garantizamos su exactitud en tiempo real. <strong>No reemplaza el consejo de un médico ni de
        un químico farmacéutico.</strong> Consulta siempre a un profesional de la salud antes de
        iniciar, cambiar o suspender un tratamiento.
      </p>
      <p className="mt-2">
        En caso de emergencia, llama al <strong>SAMU 131</strong>.
      </p>
      <p className="mt-2 text-xs text-amber-600">
        No almacenamos datos personales ni imágenes de recetas. Las fotos se procesan localmente en tu dispositivo.
      </p>
    </div>
  );
}
