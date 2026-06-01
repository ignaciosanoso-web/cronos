import { Skeleton } from '@/components/ui/Skeleton'

export default function PetitionsLoading() {
  return (
    <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-10">
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-14 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>

      <div className="h-px bg-[#4d4635] mb-10" />

      <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-5">
            <Skeleton className="w-12 h-14 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
