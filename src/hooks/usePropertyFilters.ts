import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface PropertyFiltersState {
  search: string;
  location: string;
  propertyType: string;
  listingType: 'rent' | 'sale' | 'all';
  priceMin: number;
  priceMax: number;
  bedrooms: number;
  page: number;
}

export const usePropertyFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo<PropertyFiltersState>(() => ({
    search: searchParams.get('search') || '',
    location: searchParams.get('location') || 'All Locations',
    propertyType: searchParams.get('propertyType') || '',
    listingType: (searchParams.get('listingType') as 'rent' | 'sale' | 'all') || 'all',
    priceMin: Number(searchParams.get('priceMin')) || 0,
    priceMax: Number(searchParams.get('priceMax')) || 100000000,
    bedrooms: Number(searchParams.get('bedrooms')) || 0,
    page: Number(searchParams.get('page')) || 1,
  }), [searchParams]);

  const [filters, setFilters] = useState<PropertyFiltersState>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(filters.search);

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      location: searchParams.get('location') || 'All Locations',
      propertyType: searchParams.get('propertyType') || '',
      listingType: (searchParams.get('listingType') as 'rent' | 'sale' | 'all') || 'all',
      priceMin: Number(searchParams.get('priceMin')) || 0,
      priceMax: Number(searchParams.get('priceMax')) || 100000000,
      bedrooms: Number(searchParams.get('bedrooms')) || 0,
      page: Number(searchParams.get('page')) || 1,
    });
  }, [searchParams]);

  const updateUrlParams = useCallback((newFilters: PropertyFiltersState) => {
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.location !== 'All Locations') params.set('location', newFilters.location);
    if (newFilters.propertyType) params.set('propertyType', newFilters.propertyType);
    if (newFilters.listingType !== 'all') params.set('listingType', newFilters.listingType);
    if (newFilters.priceMin > 0) params.set('priceMin', String(newFilters.priceMin));
    if (newFilters.priceMax < 100000000) params.set('priceMax', String(newFilters.priceMax));
    if (newFilters.bedrooms > 0) params.set('bedrooms', String(newFilters.bedrooms));
    if (newFilters.page > 1) params.set('page', String(newFilters.page));
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handleFilterChange = useCallback((key: keyof PropertyFiltersState, value: any) => {
    setFilters(prev => {
      const next = { ...prev, [key]: value };
      if (key !== 'page') {
        next.page = 1;
      }
      // Schedule the URL parameters update safely within a microtask
      setTimeout(() => updateUrlParams(next), 0);
      return next;
    });
  }, [updateUrlParams]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    const baseline: PropertyFiltersState = {
      search: '',
      location: 'All Locations',
      propertyType: '',
      listingType: 'all',
      priceMin: 0,
      priceMax: 100000000,
      bedrooms: 0,
      page: 1,
    };
    setFilters(baseline);
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    searchQuery,
    setSearchQuery,
    handleFilterChange,
    clearFilters
  };
};