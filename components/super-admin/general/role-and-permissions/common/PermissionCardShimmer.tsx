'use client';

export default function PermissionCardShimmer({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border shadow-xs rounded-lg overflow-hidden bg-background animate-pulse"
        >
          {/* Module Header Shimmer */}
          <div className="flex items-center justify-between p-4 bg-accent/50">
            <div className="h-5 bg-gray-300 rounded w-32"></div>
            <div className="h-5 w-5 bg-gray-300 rounded"></div>
          </div>

          {/* Module Content Shimmer */}
          <div className="p-4 space-y-4">
            {/* SubModule 1 */}
            <div className="border shadow-xs rounded-lg space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-24"></div>
                </div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </div>

              {/* Permissions Grid Shimmer */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-8 mb-3">
                {Array.from({ length: 4 }).map((_, permIndex) => (
                  <div
                    key={permIndex}
                    className="flex items-start gap-2 p-3 border rounded-lg"
                  >
                    <div className="h-4 w-4 bg-gray-300 rounded shrink-0 mt-0.5"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SubModule 2 */}
            <div className="border shadow-xs rounded-lg space-y-3">
              <div className="flex items-center justify-between p-3 bg-accent/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-300 rounded"></div>
                  <div className="h-4 bg-gray-300 rounded w-28"></div>
                </div>
                <div className="h-4 w-4 bg-gray-300 rounded"></div>
              </div>

              {/* Permissions Grid Shimmer */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-8 mb-3">
                {Array.from({ length: 3 }).map((_, permIndex) => (
                  <div
                    key={permIndex}
                    className="flex items-start gap-2 p-3 border rounded-lg"
                  >
                    <div className="h-4 w-4 bg-gray-300 rounded shrink-0 mt-0.5"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
