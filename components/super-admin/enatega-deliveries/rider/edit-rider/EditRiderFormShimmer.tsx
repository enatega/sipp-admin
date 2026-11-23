'use client';

export const EditRiderFormShimmer = () => {
  return (
    <div className="space-y-8">
      {/* Personal Information Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle Requirements Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded w-56 animate-pulse" />
        </div>
        <div className="space-y-6">
          {/* Vehicle Type - Full Width */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* Vehicle Brand & Model Year - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Vehicle Color & Number - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-28 animate-pulse" />
                <div className="h-10 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Checkboxes - 2 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-48 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-6">
          <div className="h-6 bg-gray-200 rounded w-24 animate-pulse mb-2" />
          <div className="h-4 bg-gray-200 rounded-w-80 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture - Full Width */}
          <div className="col-span-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-64 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

          {/* Document Upload Fields */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-200 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-36 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-48 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Buttons Section */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-36 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};
