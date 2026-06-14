import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Search, MapPin, ChevronDown, Check, X } from 'lucide-react';
import { Button } from '../common';
import { locations } from '../../constants/propertyOptions';
import { PropertyFiltersState } from '../../hooks/usePropertyFilters';

interface PropertyFiltersProps {
  filters: PropertyFiltersState;
  handleFilterChange: (key: keyof PropertyFiltersState, value: any) => void;
  clearFilters: () => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (open: boolean) => void;
}

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  handleFilterChange,
  clearFilters,
  isFilterOpen,
  setIsFilterOpen,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const priceRanges = [
    { label: 'All Prices', min: 0, max: 100000000 },
    { label: 'Under ₹50 Lac', min: 0, max: 5000000 },
    { label: '₹50 Lac - ₹1 Cr', min: 5000000, max: 10000000 },
    { label: '₹1 Cr - ₹3 Cr', min: 10000000, max: 30000000 },
    { label: '₹3 Cr - ₹5 Cr', min: 30000000, max: 50000000 },
    { label: 'Above ₹5 Cr', min: 50000000, max: 100000000 },
  ];

  const bedroomsOptions = [
    { label: 'Any', value: 0 },
    { label: '1+', value: 1 },
    { label: '2+', value: 2 },
    { label: '3+', value: 3 },
    { label: '4+', value: 4 },
    { label: '5+', value: 5 },
  ];

  const filteredLocationOptions = useMemo(() => {
    const options = ['All Locations', ...locations.filter(loc => loc !== 'All Locations')];
    if (!locationSearch.trim()) return options;
    return options.filter(loc => loc.toLowerCase().includes(locationSearch.toLowerCase()));
  }, [locationSearch]);

  return (
    <aside className={`
      fixed lg:relative inset-0 z-50 lg:z-auto
      ${isFilterOpen ? 'visible' : 'invisible'} lg:visible
      pointer-events-auto lg:pointer-events-auto
    `}>
      <div
        className="absolute inset-0 bg-black/50 lg:hidden"
        onClick={() => setIsFilterOpen(false)}
      />
      <div className={`absolute lg:static left-0 top-0 bottom-0 w-80 lg:w-72 bg-cream-50 lg:bg-transparent overflow-y-auto transform transition-transform duration-300 ${
        isFilterOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 p-6 lg:p-0 rounded-none lg:rounded-2xl shadow-2xl lg:shadow-none`}>
        
        <div className="lg:hidden flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-walnut-800">Filters</h3>
          <button onClick={() => setIsFilterOpen(false)} className="p-2 text-walnut-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 lg:sticky lg:top-28">
          {/* Location Dropdown */}
          <div className="bg-cream-50 rounded-xl p-6 border border-walnut-100 shadow-sm">
            <h4 className="font-semibold text-walnut-800 mb-4">Location</h4>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between pl-4 pr-4 py-3 bg-white border border-walnut-200 rounded-xl hover:border-teak-500 focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 transition-all cursor-pointer shadow-sm text-left"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="w-5 h-5 text-teak-600 flex-shrink-0" />
                  <span className="block truncate font-medium">
                    {filters.location}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-walnut-500 transform transition-transform duration-300 flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-2 bg-white border border-walnut-100 rounded-xl shadow-xl overflow-hidden transform transition-all duration-200 origin-top">
                  <div className="p-2 border-b border-walnut-50 bg-cream-50/50">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-walnut-400" />
                      <input
                        type="text"
                        value={locationSearch}
                        onChange={(e) => setLocationSearch(e.target.value)}
                        placeholder="Search micro-market or city..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-walnut-200 rounded-lg text-sm focus:outline-none focus:border-teak-500 text-walnut-800 placeholder-walnut-400"
                      />
                    </div>
                  </div>
                  <ul className="max-h-56 overflow-y-auto py-1 divide-y divide-walnut-50/40 font-sans">
                    {filteredLocationOptions.length === 0 ? (
                      <li className="px-4 py-3 text-sm text-walnut-400 italic text-center">No locations found.</li>
                    ) : (
                      filteredLocationOptions.map((loc) => {
                        const isSelected = filters.location === loc;
                        return (
                          <li key={loc}>
                            <button
                              type="button"
                              onClick={() => {
                                handleFilterChange('location', loc);
                                setIsDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                                isSelected
                                  ? 'bg-teak-50 text-teak-800 font-semibold'
                                  : 'text-walnut-700 hover:bg-cream-50'
                              }`}
                            >
                              <span className="truncate">{loc}</span>
                              {isSelected && <Check className="w-4 h-4 text-teak-600" />}
                            </button>
                          </li>
                        );
                      })
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Property Type Radio Filter */}
          <div className="bg-cream-50 rounded-xl p-6 border border-walnut-100 shadow-sm">
            <h4 className="font-semibold text-walnut-800 mb-4">Property Type</h4>
            <div className="space-y-2">
              {['', 'apartment', 'villa', 'commercial', 'land'].map((type) => (
                <label
                  key={type || 'all'}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-walnut-50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name="propertyType"
                    checked={filters.propertyType === type}
                    onChange={() => handleFilterChange('propertyType', type)}
                    className="accent-teak-600 w-4 h-4"
                  />
                  <span className="text-walnut-700 capitalize">
                    {type || 'All Types'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Radio Filter */}
          <div className="bg-cream-50 rounded-xl p-6 border border-walnut-100 shadow-sm">
            <h4 className="font-semibold text-walnut-800 mb-4">Price Range</h4>
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label
                  key={range.label}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-walnut-50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name="priceRange"
                    checked={filters.priceMin === range.min && filters.priceMax === range.max}
                    onChange={() => {
                      handleFilterChange('priceMin', range.min);
                      handleFilterChange('priceMax', range.max);
                    }}
                    className="accent-teak-600 w-4 h-4"
                  />
                  <span className="text-walnut-700">{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Bedrooms Selector Buttons */}
          <div className="bg-cream-50 rounded-xl p-6 border border-walnut-100 shadow-sm">
            <h4 className="font-semibold text-walnut-800 mb-4">Bedrooms</h4>
            <div className="flex flex-wrap gap-2">
              {bedroomsOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterChange('bedrooms', option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.bedrooms === option.value
                      ? 'bg-teak-600 text-cream-50'
                      : 'bg-walnut-100 text-walnut-700 hover:bg-walnut-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={clearFilters} className="w-full">
            Clear All Filters
          </Button>
        </div>
      </div>
    </aside>
  );
};