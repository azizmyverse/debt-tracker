import { cn } from '../../utils/cn.js';

export default function Skeleton({ className }) {
  return <div className={cn('skeleton', className)} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
