export const EditStoreShimmer = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-64 bg-gray-200 rounded" />
      
      {/* Form Card */}
      <div className="bg-white p-8 rounded-lg shadow-md border space-y-6">
        {/* Form Fields */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-10 w-full bg-gray-100 rounded" />
          </div>
        ))}
        
        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <div className="h-10 w-24 bg-gray-200 rounded" />
          <div className="h-10 w-32 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
  );
};
