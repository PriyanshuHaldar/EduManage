import React from 'react';

export const LoadingSkeleton = ({ type = 'table', count = 5 }) => {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-soft space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="w-10 h-10 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-7 w-16 bg-slate-200 rounded" />
            <div className="h-2.5 w-32 bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-soft animate-pulse space-y-4">
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-slate-200 rounded" />
          <div className="h-4 w-20 bg-slate-100 rounded" />
        </div>
        <div className="h-64 bg-slate-100/70 rounded-xl flex items-end p-4 gap-4">
          <div className="h-1/2 w-full bg-slate-200/60 rounded" />
          <div className="h-3/4 w-full bg-slate-200/60 rounded" />
          <div className="h-2/3 w-full bg-slate-200/60 rounded" />
          <div className="h-4/5 w-full bg-slate-200/60 rounded" />
        </div>
      </div>
    );
  }

  // Default: Table skeleton
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-soft overflow-hidden animate-pulse">
      <div className="p-4 border-b border-slate-100 flex justify-between">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
      <div className="divide-y divide-slate-100 p-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="py-4 px-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-32 bg-slate-200 rounded" />
                <div className="h-2.5 w-24 bg-slate-100 rounded" />
              </div>
            </div>
            <div className="h-4 w-24 bg-slate-100 rounded hidden md:block" />
            <div className="h-4 w-28 bg-slate-100 rounded hidden lg:block" />
            <div className="h-8 w-16 bg-slate-200 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;

