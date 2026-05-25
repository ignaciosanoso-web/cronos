'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#f2ca50] text-[#3c2f00] px-5 py-2.5 text-[12px] font-semibold tracking-[0.15em] uppercase hover:bg-[#ffe088] transition-colors"
    >
      Imprimir / Guardar PDF
    </button>
  )
}
