import { Skeleton, MomentGridSkeleton } from '@/components/ui/Skeleton'

export default function MarketLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      <div className="mb-12">
        <Skeleton className="h-3 w-40 mb-3" />
        <Skeleton className="h-12 w-80 mb-3" />
        <Skeleton className="h-5 w-96" />
      </div>

      <div className="h-px bg-[#4d4635] mb-10" />

      <Skeleton className="h-3 w-32 mb-6" />
      <MomentGridSkeleton count={6} />
    </main>
  )
}
