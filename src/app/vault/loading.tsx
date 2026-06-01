import { Skeleton, MomentCardSkeleton } from '@/components/ui/Skeleton'

export default function VaultLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-6 mb-10">
        <div className="max-w-xl">
          <Skeleton className="h-12 w-64 mb-3" />
          <Skeleton className="h-5 w-96" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-16">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#131313] p-8">
            <Skeleton className="h-3 w-28 mb-3" />
            <Skeleton className="h-10 w-24" />
          </div>
        ))}
      </div>

      <div className="h-px bg-[#4d4635] mb-10" />

      <Skeleton className="h-8 w-56 mb-8" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <MomentCardSkeleton key={i} />
        ))}
      </div>
    </main>
  )
}
