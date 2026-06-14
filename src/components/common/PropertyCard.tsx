import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize, ArrowRight, Star } from 'lucide-react';
import { Property } from '../../types';
import { useState } from 'react';
import { fallbackPropertyImage } from '../../constants/propertyOptions';

interface PropertyCardProps {
  property: Property;
  variant?: 'default' | 'horizontal';
  isRealtorOwner?: boolean;
}

const PropertyCard = ({
  property,
  variant = 'default',
  isRealtorOwner = false,
}: PropertyCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `₹${price.toLocaleString('en-IN')}/mo`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/property/${property.id}`}
        className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-walnut-100/60 transition-all duration-500 transform hover:-translate-y-1.5 w-full"
      >
        {/* Image Frame */}
        <div className="relative w-full md:w-72 lg:w-80 h-48 md:h-auto overflow-hidden bg-walnut-50 flex-shrink-0">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-walnut-100 animate-pulse" />
          )}
          <img
            src={property.images?.[0] || fallbackPropertyImage}
            alt={property.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = fallbackPropertyImage;
              setImageLoaded(true);
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          
          {/* Status Labels */}
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
            <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm text-white ${
              property.listingType === 'sale' ? 'bg-teal-600' : 'bg-amber-600'
            }`}>
              FOR {property.listingType.toUpperCase()}
            </span>
            {property.featured && (
              <span className="flex items-center gap-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full shadow-sm bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                <Star className="w-3 h-3 fill-white" /> Featured
              </span>
            )}
          </div>
          {isRealtorOwner && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest rounded-md bg-walnut-900/90 text-cream-50 shadow-md backdrop-blur-xs">
                Your Listing
              </span>
            </div>
          )}
        </div>

        {/* Content Side Box */}
        <div className="flex-1 p-5 flex flex-col justify-between bg-white">
          <div className="space-y-2">
            <span className="text-teak-600 text-[11px] font-bold uppercase tracking-widest">
              {property.propertyType}
            </span>
            
            <h3 className="text-lg font-bold text-walnut-800 tracking-tight leading-snug line-clamp-2 group-hover:text-teak-700 transition-colors">
              {property.title}
            </h3>

            <div className="text-xl font-black text-walnut-900 tracking-tight pt-0.5">
              {formatPrice(property.price, property.listingType)}
            </div>

            <div className="flex items-center gap-1 text-walnut-500 text-sm">
              <MapPin className="w-3.5 h-3.5 text-teak-600 flex-shrink-0" />
              <span className="truncate font-medium">{property.location}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-walnut-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4 text-walnut-600 text-xs font-semibold">
              <div className="flex items-center gap-1">
                <Bed className="w-3.5 h-3.5 text-teak-600" />
                <span>{property.bedrooms} <span className="text-walnut-400 font-normal">Beds</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="w-3.5 h-3.5 text-teak-600" />
                <span>{property.bathrooms} <span className="text-walnut-400 font-normal">Baths</span></span>
              </div>
              <div className="flex items-center gap-1">
                <Maximize className="w-3.5 h-3.5 text-teak-600" />
                <span>{property.area.toLocaleString()} <span className="text-walnut-400 font-normal">sqft</span></span>
              </div>
            </div>

            <div className="text-xs font-bold text-teak-600 flex items-center gap-1 group-hover:text-teak-700 transition-colors">
              View Details 
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/property/${property.id}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-walnut-100/50 transition-all duration-400 transform hover:-translate-y-1.5 h-full"
    >
      {/* Modern Widescreen Aspect Framing to shrink massive card heights */}
      <div className="relative aspect-[16/10] overflow-hidden bg-walnut-50 w-full flex-shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-walnut-100 animate-pulse" />
        )}
        <img
          src={property.images?.[0] || fallbackPropertyImage}
          alt={property.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = fallbackPropertyImage;
            setImageLoaded(true);
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />

        {/* Floating Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs text-white ${
            property.listingType === 'sale' ? 'bg-teal-600' : 'bg-amber-600'
          }`}>
            FOR {property.listingType.toUpperCase()}
          </span>
          {property.featured && (
            <span className="flex items-center gap-0.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-xs bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
              <Star className="w-2.5 h-2.5 fill-white" /> Featured
            </span>
          )}
        </div>

        {isRealtorOwner && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 text-[8px] font-bold uppercase tracking-widest rounded-md bg-walnut-900/90 text-cream-50 shadow-xs">
              Your Listing
            </span>
          </div>
        )}
      </div>

      {/* Workspace text area wrapper */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1">
          <span className="text-teak-600 text-[10px] font-bold uppercase tracking-widest block">
            {property.propertyType}
          </span>
          
          <h3 className="text-base font-bold text-walnut-800 tracking-tight leading-snug line-clamp-2 group-hover:text-teak-700 transition-colors min-h-[44px]">
            {property.title}
          </h3>

          <div className="text-xl font-black text-walnut-900 tracking-tight pt-0.5">
            {formatPrice(property.price, property.listingType)}
          </div>

          <div className="flex items-center gap-1 text-walnut-500 text-xs font-medium pt-0.5">
            <MapPin className="w-3.5 h-3.5 text-teak-600 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* Metadata Row Panel Grid */}
          <div className="flex items-center justify-between p-2.5 bg-cream-50/50 rounded-xl border border-walnut-100/40 text-walnut-700 text-[11px] font-bold tracking-tight">
            <div className="flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-teak-600" />
              <span>{property.bedrooms} <span className="text-walnut-400 font-normal">Beds</span></span>
            </div>
            <div className="w-px h-3 bg-walnut-200" />
            <div className="flex items-center gap-1">
              <Bath className="w-3.5 h-3.5 text-teak-600" />
              <span>{property.bathrooms} <span className="text-walnut-400 font-normal">Baths</span></span>
            </div>
            <div className="w-px h-3 bg-walnut-200" />
            <div className="flex items-center gap-1">
              <Maximize className="w-3.5 h-3.5 text-teak-600" />
              <span>{property.area.toLocaleString()} <span className="text-walnut-400 font-normal">sqft</span></span>
            </div>
          </div>

          {/* Luxury action button link panel trigger */}
          <div className="w-full bg-walnut-50/70 group-hover:bg-teak-600 text-walnut-700 group-hover:text-cream-50 font-bold text-xs py-2.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-1 border border-walnut-200/40 group-hover:border-teak-600 shadow-xs">
            View Details
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;