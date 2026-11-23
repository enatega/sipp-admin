import { Skeleton } from '@/components/ui/skeleton';
import PermissionCardShimmer from '../common/PermissionCardShimmer';

export default function EditRoleShimmer() {
  return (
    <div className="space-y-6 p-6">
      {/* Form Fields Shimmer */}
      <div className="space-y-4">
        {/* Role Name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Assign To */}
        <div className="flex items-end gap-2">
            <div className="w-full space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-11 w-full" />
            </div>
          <Skeleton className="h-11 w-32" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>

      {/* Permissions Shimmer */}
      <div className="space-y-4">
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <PermissionCardShimmer count={2} />
      </div>

      {/* Buttons Shimmer */}
      <div className="flex justify-end gap-4 pt-5">
        <Skeleton className="h-11 w-24" />
        <Skeleton className="h-11 w-28" />
      </div>
    </div>
  );
}
