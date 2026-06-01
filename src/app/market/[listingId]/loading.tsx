import { Skeleton } from '@/components/ui/Skeleton'

export default function ListingLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-10 md:py-16">
      <Skeleton className="h-3 w-40 mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
        <Skeleton className="aspect-[4/3] w-full" />

        <div>
          <Skeleton className="h-3 w-40 mb-3" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-10 w-1/2 mb-6" />
          <div className="h-px bg-[#4d4635] mb-6" />
          <Skeleton className="h-3 w-24 mb-2" />
          <Skeleton className="h-12 w-40 mb-8" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </main>
  )
}
