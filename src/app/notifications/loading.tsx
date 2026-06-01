import { Skeleton } from '@/components/ui/Skeleton'

export default function NotificationsLoading() {
  return (
    <main className="max-w-[900px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-10">
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-10 w-72" />
      </div>

      <div className="h-px bg-[#4d4635] mb-10" />

      <div className="space-y-px">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-5 p-5 bg-[#131313]">
            <div className="w-2" />
            <Skeleton className="h-5 w-5 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
