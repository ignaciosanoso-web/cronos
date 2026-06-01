import { Skeleton } from '@/components/ui/Skeleton'

export default function MyBidsLoading() {
  return (
    <main className="max-w-[1100px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-10">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-10 w-64" />
      </div>

      <div className="h-px bg-[#4d4635] mb-10" />

      <div className="border border-[#4d4635] divide-y divide-[#4d4635]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-5">
            <Skeleton className="w-16 h-16 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-7 w-24" />
          </div>
        ))}
      </div>
    </main>
  )
}
