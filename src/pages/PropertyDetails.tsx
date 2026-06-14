import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Bed, Bath, Maximize,
  Phone, Mail, ChevronLeft, ChevronRight, Check, Send
} from 'lucide-react';

import { Button } from '../components/common';
import { Property, Inquiry } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { fallbackPropertyImage } from '../constants/propertyOptions';


const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState<Property | null>(null);
  const { user } = useAuth();

  const isRealtorOwner =
    user?.role === 'realtor' &&
    property &&
    (
      (property as any).realtor_id === user.id ||
      (property as any).realtor?.id === user.id
    );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    const loadProperty = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.getProperty(id);
        setProperty(response.data || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load property');
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [id]);

  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setIsSendingInquiry(true);
      setInquiryStatus('');
      await api.createInquiry({
        ...inquiryForm,
        propertyId: property.id,
      });
      setInquiryStatus('Inquiry sent successfully.');
      setInquiryForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setInquiryStatus(err instanceof Error ? err.message : 'Failed to send inquiry');
    } finally {
      setIsSendingInquiry(false);
    }
  };

  const formatPrice = (price: number, listingType: string) => {
    if (listingType === 'rent') {
      return `₹${price.toLocaleString('en-IN')}/month`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} Lac`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="aspect-[21/9] bg-walnut-100 rounded-2xl mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-walnut-100 rounded w-1/2" />
                <div className="h-4 bg-walnut-100 rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-walnut-100 rounded" />
                  <div className="h-4 bg-walnut-100 rounded w-3/4" />
                </div>
              </div>
              <div className="h-96 bg-walnut-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-walnut-800 mb-4">Property Not Found</h1>
          <p className="text-walnut-600 mb-6">{error || "The property you're looking for doesn't exist."}</p>
          <Link to="/properties">
            <Button>Browse Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-24">
      {/* Lightbox */}
      {showLightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowLightbox(false)}
            className="absolute top-4 right-4 text-cream-50 hover:text-cream-200 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => setCurrentImageIndex(i => (i === 0 ? property.images.length - 1 : i - 1))}
            className="absolute left-4 p-2 rounded-full bg-cream-50/10 hover:bg-cream-50/20 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-cream-50" />
          </button>
          <img
            src={property.images[currentImageIndex] || fallbackPropertyImage}
            alt={property.title}
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
          />
          <button
            onClick={() => setCurrentImageIndex(i => (i === property.images.length - 1 ? 0 : i + 1))}
            className="absolute right-4 p-2 rounded-full bg-cream-50/10 hover:bg-cream-50/20 transition-colors"
          >
            <ChevronRight className="w-8 h-8 text-cream-50" />
          </button>
          <p className="absolute bottom-4 text-cream-200 text-sm">
            {currentImageIndex + 1} / {property.images.length}
          </p>
        </div>
      )}

      {/* Image Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-[50vh] lg:h-[60vh] rounded-2xl overflow-hidden">
          <div
            className="col-span-4 lg:col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => {
              setCurrentImageIndex(0);
              setShowLightbox(true);
            }}
          >
            <img
              src={property.images?.[0] || fallbackPropertyImage}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = fallbackPropertyImage;
              }}
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {property.images.slice(1, 5).map((img, index) => (
            <div
              key={index}
              className="relative cursor-pointer group hidden lg:block"
              onClick={() => {
                setCurrentImageIndex(index + 1);
                setShowLightbox(true);
              }}
            >
              <img
                src={img || property.images?.[0] || fallbackPropertyImage}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackPropertyImage;
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              {index === 3 && property.images.length > 5 && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                  <span className="text-cream-50 font-bold text-xl">
                    +{property.images.length - 5} more
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mt-6 text-sm text-walnut-500">
          <Link to="/" className="hover:text-teak-600 transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/properties" className="hover:text-teak-600 transition-colors">Properties</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-walnut-800">{property.location}</span>
        </div>
      </div>

      {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* Main two-column layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Property Info */}
            <div className="lg:col-span-2 space-y-8">
            <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                      property.listingType === 'sale'
                        ? 'bg-teal-600 text-white'
                        : 'bg-amber-600 text-white'
                    }`}>
                      FOR {property.listingType.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-teak-100 text-teak-700">
                      {property.propertyType.charAt(0).toUpperCase() + property.propertyType.slice(1)}
                    </span>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-serif font-bold text-walnut-800">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 text-walnut-600">
                    <MapPin className="w-5 h-5 text-teak-600" />
                    <span className="text-sm">{property.address}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between py-6 border-y border-walnut-100">
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-walnut-700">
                      <Bed className="w-5 h-5 text-teak-600" />
                      <span className="text-xl font-bold">{property.bedrooms}</span>
                    </div>
                    <span className="text-xs text-walnut-500">Bedrooms</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-walnut-700">
                      <Bath className="w-5 h-5 text-teak-600" />
                      <span className="text-xl font-bold">{property.bathrooms}</span>
                    </div>
                    <span className="text-xs text-walnut-500">Bathrooms</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-walnut-700">
                      <Maximize className="w-5 h-5 text-teak-600" />
                      <span className="text-xl font-bold">{property.area.toLocaleString()}</span>
                    </div>
                    <span className="text-xs text-walnut-500">Sq.Ft.</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl lg:text-3xl font-bold text-teak-700">
                    {formatPrice(property.price, property.listingType)}
                  </p>
                  {property.listingType === 'rent' && (
                    <p className="text-sm text-walnut-500">Per Month</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold text-walnut-800 mb-4">Description</h3>
                <p className="text-walnut-600 leading-relaxed">{property.description}</p>
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100">
              <h3 className="text-lg font-semibold text-walnut-800 mb-6">Amenities & Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 p-3 rounded-xl bg-walnut-50"
                  >
                    <Check className="w-4 h-4 text-teak-600" />
                    <span className="text-sm text-walnut-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>


          </div>

            {/* Realtor & Inquiry */}
          <div className="space-y-6">
            {isRealtorOwner ? (
              <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-walnut-100">
                <h3 className="text-lg font-semibold text-walnut-800 mb-6">Property Management Panel</h3>

                {/* 1) Property Status */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">Active / Inactive</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {(property as any)?.status || 'Active'}
                      </span>
                    </div>
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">For Sale / For Rent</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {property.listingType === 'rent' ? 'For Rent' : 'For Sale'}
                      </span>
                    </div>
                  </div>

                  {/* 4) Property Information */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">Listing Date</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {(property as any)?.createdAt || '-'}
                      </span>
                    </div>
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">Last Updated Date</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {(property as any)?.updatedAt || (property as any)?.modifiedAt || '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-walnut-50 rounded-xl px-4 py-3">
                    <span className="text-walnut-600 text-sm">Property ID</span>
                    <span className="font-semibold text-walnut-800 text-sm">{property.id}</span>
                  </div>

                  {/* 2) Property Actions */}
                  <div>
                    <h4 className="text-sm font-semibold text-walnut-800 mb-3">Property Actions</h4>
                    <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                          navigate(`/add-property?id=${property.id}`);
                        }}
                      >

                        Edit Property
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this property?')) {
                            api.deleteProperty(property.id).then(() => navigate('/dashboard'));
                          }
                        }}
                      >
                        Delete Property
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          // UI placeholder if backend doesn't support status changes yet
                          alert('Update listing status is not implemented yet.');
                        }}
                        className="col-span-2"
                      >
                        {property.listingType === 'rent' ? 'Mark as Rented' : 'Mark as Sold'}
                      </Button>

                      <Button
                        variant="primary"
                        onClick={() => {
                          alert('Update listing is not implemented yet.');
                        }}
                        className="col-span-2"
                      >
                        Update Listing
                      </Button>
                    </div>
                  </div>

                  {/* 3) Inquiry Overview */}
                  <div className="flex items-center justify-between bg-walnut-50 rounded-xl px-4 py-3">
                    <span className="text-sm text-walnut-600">Total Inquiries Received</span>
                    <span className="font-semibold text-walnut-800 text-sm">
                      {(property as any)?.inquiriesCount ?? 0}
                    </span>
                  </div>

                  <Button
                    variant="outline"

                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    View Inquiries
                  </Button>

                  {/* 5) Performance Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">Total Views</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {(property as any)?.viewsCount ?? 0}
                      </span>
                    </div>
                    <div className="flex flex-col bg-walnut-50 rounded-xl px-4 py-3">
                      <span className="text-xs text-walnut-600">Inquiry Count</span>
                      <span className="font-semibold text-walnut-800 mt-1">
                        {(property as any)?.inquiriesCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Normal User View */}
                {/* Realtor Card */}
                <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-walnut-100">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src={property.realtor.avatar || fallbackPropertyImage}
                      alt={property.realtor.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-walnut-800">{property.realtor.name}</h4>
                      <p className="text-sm text-walnut-500">{property.realtor.email}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <a
                      href={`tel:${property.realtor.phone}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-teak-600 text-cream-50 hover:bg-teak-700 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      <span className="font-medium">{property.realtor.phone}</span>
                    </a>
                    <a
                      href={`mailto:${property.realtor.email}`}
                      className="flex items-center gap-3 p-3 rounded-xl bg-walnut-100 text-walnut-700 hover:bg-walnut-200 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>{property.realtor.email}</span>
                    </a>
                  </div>
                </div>

                {/* Inquiry Form */}
                <div className="bg-walnut-900 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-cream-50 mb-6">Make an Inquiry</h3>
                  <form onSubmit={handleInquirySubmit} className="space-y-4">
                    {inquiryStatus && (
                      <div className="p-3 rounded-xl bg-cream-50/10 text-cream-100 text-sm">
                        {inquiryStatus}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs text-walnut-300 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-walnut-800 border border-walnut-700 rounded-xl text-cream-100 focus:outline-none focus:ring-2 focus:ring-teak-500 placeholder-walnut-500"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-walnut-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        value={inquiryForm.email}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-walnut-800 border border-walnut-700 rounded-xl text-cream-100 focus:outline-none focus:ring-2 focus:ring-teak-500 placeholder-walnut-500"
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-walnut-300 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        required
                        className="w-full px-4 py-3 bg-walnut-800 border border-walnut-700 rounded-xl text-cream-100 focus:outline-none focus:ring-2 focus:ring-teak-500 placeholder-walnut-500"
                        placeholder="+91 98471 00000"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-walnut-300 mb-1">Message</label>
                      <textarea
                        value={inquiryForm.message}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 bg-walnut-800 border border-walnut-700 rounded-xl text-cream-100 focus:outline-none focus:ring-2 focus:ring-teak-500 placeholder-walnut-500 resize-none"
                        placeholder="I'm interested in this property..."
                      />
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-teak-500 to-walnut-600 text-cream-50 py-3"
                      isLoading={isSendingInquiry}
                    >
                      <Send className="w-4 h-4" />
                      Send Inquiry
                    </Button>
                  </form>
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;

