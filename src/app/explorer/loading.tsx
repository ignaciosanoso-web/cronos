import { Skeleton, MomentGridSkeleton } from '@/components/ui/Skeleton'

export default function ExplorerLoading() {
  return (
    <main className="max-w-[1440px] mx-auto px-6 md:px-8 py-16">
      <div className="text-center mb-12">
        <Skeleton className="h-12 w-96 mx-auto mb-3" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      <div className="border border-[#4d4635] p-6 h-40" />

      <div className="mt-10">
        <Skeleton className="h-3 w-40 mb-6" />
        <MomentGridSkeleton count={9} />
      </div>
    </main>
  )
}
