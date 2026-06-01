import { Skeleton } from '@/components/ui/Skeleton'

export default function AdminLoading() {
  return (
    <div className="p-8 max-w-6xl">
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="h-px bg-[#4d4635] mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#4d4635] mb-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-[#131313] p-6">
            <Skeleton className="h-3 w-24 mb-3" />
            <Skeleton className="h-9 w-20" />
          </div>
        ))}
      </div>

      <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  )
}
