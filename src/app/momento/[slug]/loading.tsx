import { Skeleton } from '@/components/ui/Skeleton'

export default function MomentoLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-16">
      {/* Volver */}
      <Skeleton className="h-3 w-32 mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        {/* Imagen */}
        <Skeleton className="aspect-[4/3] w-full" />

        {/* Info */}
        <div>
          <Skeleton className="h-3 w-40 mb-3" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-2/3 mb-6" />

          <div className="h-px bg-[#4d4635] mb-6" />

          {/* Bloque de subasta */}
          <div className="border border-[#4d4635] p-6 space-y-4 mb-6">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-12 w-48" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-11 w-full" />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </main>
  )
}
