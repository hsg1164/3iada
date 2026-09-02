import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" style={{ background: "rgba(6,19,41,0.5)" }} />
          <Skeleton className="h-4 w-64" style={{ background: "rgba(6,19,41,0.4)" }} />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-[10px]" style={{ background: "rgba(6,19,41,0.5)" }} />
          <Skeleton className="h-10 w-10 rounded-[10px]" style={{ background: "rgba(6,19,41,0.5)" }} />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-[170px] rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
        ))}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-80 rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
        <Skeleton className="h-80 rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
        <Skeleton className="h-80 rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-48 rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
        <Skeleton className="h-48 rounded-[14px]" style={{ background: "rgba(6,19,41,0.5)" }} />
      </div>
    </div>
  );
}
