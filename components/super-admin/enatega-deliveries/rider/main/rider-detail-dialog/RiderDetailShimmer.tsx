'use client';

export const RiderDetailShimmer = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* Rejection Reason Banner Shimmer */}
      <div className="h-20 bg-gray-200 rounded-xl animate-pulse" />

      {/* Header Card Shimmer */}
      <div
        className="h-32 rounded-2xl animate-pulse"
        style={{
          background: 'linear-gradient(to right, #1E40AF, #2563EB)',
        }}
      />

      {/* Contact Info Cards Shimmer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-24 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Vehicle Details Shimmer */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4 w-full">
          <div className="h-6 w-6 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 bg-gray-200/60 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>

      {/* Documents Section Shimmer */}
      <div className="space-y-4">
        <div className="h-6 w-48 bg-gray-200 rounded-lg animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
