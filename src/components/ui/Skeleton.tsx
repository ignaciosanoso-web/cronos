interface SkeletonProps {
  className?: string
}

/** Bloque de carga con shimmer sutil, acorde al tema oscuro de Cronos. */
export function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`animate-pulse bg-[#1c1b1b] ${className}`} />
}

/** Tarjeta de momento en estado de carga (coincide con el grid 4:3 del explorer/market). */
export function MomentCardSkeleton() {
  return (
    <div className="border-b border-r border-[#4d4635] bg-[#131313]">
      <Skeleton className="aspect-[4/3] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-3/4" />
        <div className="h-px bg-[#4d4635]" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  )
}

/** Grid de tarjetas en carga. */
export function MomentGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-[#4d4635]">
      {Array.from({ length: count }).map((_, i) => (
        <MomentCardSkeleton key={i} />
      ))}
    </div>
  )
}
