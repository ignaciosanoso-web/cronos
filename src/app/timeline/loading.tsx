import { Skeleton } from '@/components/ui/Skeleton'

export default function TimelineLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-12">
        <Skeleton className="h-3 w-48 mb-2" />
        <Skeleton className="h-14 w-80 mb-3" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="h-px bg-[#4d4635] mb-16" />

      <div className="space-y-12">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-8">
            <Skeleton className="h-4 w-20 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
