import { Skeleton } from "@/components/ui/skeleton";

export default function SignupLoading() {
  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-hidden bg-gradient-to-br from-rose-50 via-pink-50/30 to-orange-50/50 px-4 py-10 lg:py-16">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(255,242,245,0.84),rgba(255,247,243,0.68),rgba(255,255,255,0.38))]" />

      <div className="relative z-[1] flex w-full max-w-4xl flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-[20px]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-3">
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-full max-w-[48ch]" />
          <Skeleton className="h-4 w-5/6 max-w-[44ch]" />
        </div>

        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-2">
          <div className="order-2 flex flex-col gap-4 rounded-[28px] border border-border/40 bg-card/70 p-6 shadow-md lg:order-1">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
            <div className="mt-2 flex flex-col gap-3">
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          </div>

          <div className="order-1 flex flex-col gap-4 rounded-[28px] border border-border/40 bg-card/70 p-6 shadow-md lg:order-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-56" />
            <div className="mt-2 flex flex-col gap-3">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <Skeleton className="mt-2 h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
