'use client';

import * as React from 'react';

export const OrderDetailShimmer: React.FC = () => {
  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* Left column (70%) */}
      <div className="xl:basis-[70%] w-full flex flex-col gap-6">
        <div className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-[420px] bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>

      {/* Right column (30%) */}
      <div className="xl:basis-[30%] w-full flex flex-col gap-6">
        <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
};

export default OrderDetailShimmer;
