import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Grid3X3, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard, Button } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { usePropertyFilters } from '../hooks/usePropertyFilters';
import { useDebounce } from '../hooks/useDebounce';
import { PropertyFilters } from '../components/properties/PropertyFilters';
import { Property } from '../types';

const PropertyListing = () => {
  const { user } = useAuth();
  
  const {
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    clearFilters
  } = usePropertyFilters();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Sync debounced query to state triggers automatically wrapped safely inside an effect hook
  useEffect(() => {
    handleFilterChange('search', debouncedSearch);
  }, [debouncedSearch]);

  const loadPropertiesFromServer = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await api.getProperties({
        search: filters.search,
        location: filters.location,
        propertyType: filters.propertyType,
        listingType: filters.listingType,
        priceMin: filters.priceMin,
        priceMax: filters.priceMax,
        bedrooms: filters.bedrooms,
        page: filters.page,
        limit: 6
      });

      if (response.data) {
        setProperties(response.data.properties || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalCount(response.data.totalCount || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to communicate with real estate server listings.');
    } finally {
      setIsLoading(false);
    }
  }, [filters.search, filters.location, filters.propertyType, filters.listingType, filters.priceMin, filters.priceMax, filters.bedrooms, filters.page]);

  useEffect(() => {
    loadPropertiesFromServer();
  }, [loadPropertiesFromServer]);

  return (
    <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-24">
      {/* Search Header Banner */}
      <div className="bg-walnut-900 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search properties, locations, keywords..."
                  className="w-full pl-12 pr-4 py-4 focus:outline-none text-walnut-800 placeholder-walnut-400"
                />
              </div>
              <button
                type="button"
                onClick={() => handleFilterChange('search', searchQuery)}
                className="px-8 bg-gradient-to-r from-teak-600 to-walnut-700 text-cream-50 font-semibold hover:opacity-90 transition-opacity"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {(['all', 'sale', 'rent'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('listingType', type)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.listingType === type
                      ? 'bg-teak-600 text-cream-50'
                      : 'bg-cream-50/10 text-cream-100 hover:bg-cream-50/20'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'sale' ? 'For Sale' : 'For Rent'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Filter Grid Controllers */}
        <div className="lg:hidden flex justify-between items-center mb-6">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-cream-50 rounded-xl border border-walnut-100 shadow-sm text-walnut-700 font-medium"
          >
            <SlidersHorizontal className="w-5 h-5" />
            Filters
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-teak-600 text-cream-50' : 'bg-walnut-100 text-walnut-600'}`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-teak-600 text-cream-50' : 'bg-walnut-100 text-walnut-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          <PropertyFilters
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
            isFilterOpen={isFilterOpen}
            setIsFilterOpen={setIsFilterOpen}
          />

          {/* Property Results Framework Panel */}
          <main className="flex-1">
            <div className="hidden lg:flex justify-between items-center mb-6">
              <div>
                <p className="text-walnut-600">
                  Found <span className="font-semibold text-walnut-800">{totalCount}</span> luxury listings matching parameters
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg ${viewMode === 'grid' ? 'bg-teak-600 text-cream-50' : 'bg-cream-50 text-walnut-600 border border-walnut-100'}`}
                  >
                    <Grid3X3 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg ${viewMode === 'list' ? 'bg-teak-600 text-cream-50' : 'bg-cream-50 text-walnut-600 border border-walnut-100'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' : 'space-y-6'}>
                {[...Array(3)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-walnut-100 p-4 animate-pulse space-y-4">
                    <div className="aspect-[4/3] bg-walnut-100 rounded-xl" />
                    <div className="h-4 bg-walnut-100 rounded w-3/4" />
                    <div className="h-4 bg-walnut-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-20 bg-cream-50 border border-dashed border-walnut-200 rounded-2xl p-8">
                <div className="w-20 h-20 bg-walnut-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-walnut-400" />
                </div>
                <h3 className="text-xl font-semibold text-walnut-800 mb-2">No Properties Match Selection</h3>
                <p className="text-walnut-600 mb-6">{error || 'Try broadening your search query or altering structural filters.'}</p>
                <Button onClick={clearFilters}>Reset Architecture</Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isRealtorOwner={
                      user?.role === 'realtor' &&
                      ((property as any).realtor_id === user.id || property.realtor?.id === user.id)
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    variant="horizontal"
                    isRealtorOwner={
                      user?.role === 'realtor' &&
                      ((property as any).realtor_id === user.id || property.realtor?.id === user.id)
                    }
                  />
                ))}
              </div>
            )}

            {!isLoading && totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={filters.page === 1}
                  className="p-2 rounded-lg bg-cream-50 border border-walnut-100 text-walnut-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-walnut-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handleFilterChange('page', page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      filters.page === page
                        ? 'bg-teak-600 text-cream-50'
                        : 'bg-cream-50 border border-walnut-100 text-walnut-600 hover:bg-walnut-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => handleFilterChange('page', Math.min(totalPages, filters.page + 1))}
                  disabled={filters.page === totalPages}
                  className="p-2 rounded-lg bg-cream-50 border border-walnut-100 text-walnut-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-walnut-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PropertyListing;