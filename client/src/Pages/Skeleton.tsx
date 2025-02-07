import React from 'react';

const Skeleton = () => {
  return (
    <div className="p-4 border border-purple-500/20 rounded-lg bg-purple-900/40 backdrop-blur-sm">
      <div className="animate-pulse flex flex-col space-y-4">
        <div className="h-6 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded"></div>
      </div>
    </div>
  );
};

export default Skeleton;