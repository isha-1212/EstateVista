export const PropertyCardSkeleton = () => {
  return (
    <div className="bg-cream-50 rounded-2xl overflow-hidden shadow-sm border border-walnut-100 animate-pulse">
      <div className="aspect-[4/3] bg-walnut-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 bg-walnut-100 rounded" />
        <div className="h-5 w-3/4 bg-walnut-100 rounded" />
        <div className="h-4 w-1/2 bg-walnut-100 rounded" />
        <div className="flex gap-4 pt-4 border-t border-walnut-100">
          <div className="h-4 w-16 bg-walnut-100 rounded" />
          <div className="h-4 w-16 bg-walnut-100 rounded" />
          <div className="h-4 w-16 bg-walnut-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export const GridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const SearchSkeleton = () => {
  return (
    <div className="bg-cream-50 rounded-2xl p-8 shadow-lg border border-walnut-100 animate-pulse space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="h-12 bg-walnut-100 rounded-xl" />
        <div className="h-12 bg-walnut-100 rounded-xl" />
        <div className="h-12 bg-walnut-100 rounded-xl" />
        <div className="h-12 bg-tal-100 rounded-xl" />
      </div>
    </div>
  );
};
