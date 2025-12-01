import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="loading loading-spinner loading-lg text-primary"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
