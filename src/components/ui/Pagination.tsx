import Link from 'next/link'

interface PaginationProps {
  currentPage: number
  totalPages: number
  /** Query params actuales a preservar (sin incluir `page`) */
  params?: Record<string, string | undefined>
  /** Ruta base, p.ej. "/explorer" */
  basePath: string
}

function buildHref(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v) sp.set(k, v)
    }
  }
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/** Devuelve la lista de páginas a mostrar con elipsis (…) representada por -1 */
function pageWindow(current: number, total: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result: number[] = []
  let prev = 0
  for (const p of sorted) {
    if (p - prev > 1) result.push(-1)
    result.push(p)
    prev = p
  }
  return result
}

export function Pagination({ currentPage, totalPages, params, basePath }: PaginationProps) {
  if (totalPages <= 1) return null

  const window = pageWindow(currentPage, totalPages)
  const linkBase =
    'min-w-9 h-9 px-3 flex items-center justify-center border text-sm transition-colors tabular-nums'

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Paginación">
      {/* Anterior */}
      {currentPage > 1 ? (
        <Link
          href={buildHref(basePath, currentPage - 1, params)}
          className={`${linkBase} border-[#4d4635] text-[#99907c] hover:border-[#f2ca50] hover:text-[#f2ca50]`}
          aria-label="Página anterior"
        >
          ←
        </Link>
      ) : (
        <span className={`${linkBase} border-[#2a2a2a] text-[#2a2a2a] cursor-not-allowed`}>←</span>
      )}

      {/* Números */}
      {window.map((p, i) =>
        p === -1 ? (
          <span key={`gap-${i}`} className="px-1 text-[#4d4635] select-none">
            …
          </span>
        ) : p === currentPage ? (
          <span
            key={p}
            aria-current="page"
            className={`${linkBase} border-[#f2ca50] bg-[rgba(242,202,80,0.08)] text-[#f2ca50] font-semibold`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, params)}
            className={`${linkBase} border-[#4d4635] text-[#99907c] hover:border-[#f2ca50] hover:text-[#f2ca50]`}
          >
            {p}
          </Link>
        )
      )}

      {/* Siguiente */}
      {currentPage < totalPages ? (
        <Link
          href={buildHref(basePath, currentPage + 1, params)}
          className={`${linkBase} border-[#4d4635] text-[#99907c] hover:border-[#f2ca50] hover:text-[#f2ca50]`}
          aria-label="Página siguiente"
        >
          →
        </Link>
      ) : (
        <span className={`${linkBase} border-[#2a2a2a] text-[#2a2a2a] cursor-not-allowed`}>→</span>
      )}
    </nav>
  )
}
