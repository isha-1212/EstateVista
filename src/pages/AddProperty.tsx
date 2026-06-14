import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Upload, X, Image as ImageIcon, MapPin, DollarSign,
  Home, Building2, Info, Check, AlertCircle
} from 'lucide-react';
import { Button } from '../components/common';
import { api } from '../services/api';
import { locations } from '../constants/propertyOptions';
import { useAuth } from '../context/AuthContext';

// Validation Architecture Configuration Constants
const MIN_TITLE_LENGTH = 3;
const MAX_TITLE_LENGTH = 100;
const MIN_DESCRIPTION_LENGTH = 20;
const MAX_DESCRIPTION_LENGTH = 2000;
const MIN_ADDRESS_LENGTH = 5;
const MAX_ADDRESS_LENGTH = 300;
const MAX_IMAGE_COUNT = 10;
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

interface FormData {
  title: string;
  description: string;
  price: string;
  priceUnit: 'lac' | 'cr' | 'month';
  propertyType: 'apartment' | 'villa' | 'commercial' | 'land';
  listingType: 'rent' | 'sale';
  location: string;
  address: string;
  bedrooms: string;
  bathrooms: string;
  area: string;
  images: (File | string)[];
  amenities: string[];
}

interface FormErrors {
  [key: string]: string;
}

const AddProperty = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editingId = searchParams.get('id');

  const { user, loading } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    priceUnit: 'lac',
    propertyType: 'villa',
    listingType: 'sale',
    location: locations[1],
    address: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    images: [],
    amenities: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitMessage, setSubmitMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const allAmenities = useMemo(() => [
    'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Air Conditioning',
    'Security', 'Clubhouse', 'Power Backup', 'Fireplace', 'Private Terrace',
    'Lake View', 'Mountain View', 'Sea View', 'Private Pool', 'Servant Quarters',
    'Modular Kitchen', 'Smart Home', 'Solar Powered', 'Rainwater Harvesting',
    'Children Play Area', 'EV Charging', 'CCTV', 'Intercom'
  ], []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'realtor') {
      navigate('/access-denied');
      return;
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    const loadProperty = async () => {
      if (!editingId) return;

      try {
        const response = await api.getProperty(editingId);
        const property = response.data;
        if (!property) return;

        setFormData({
          title: property.title,
          description: property.description,
          price: property.listingType === 'rent'
            ? String(property.price)
            : String(Math.round(property.price / 100000)),
          priceUnit: property.listingType === 'rent' ? 'month' : 'lac',
          propertyType: property.propertyType,
          listingType: property.listingType,
          location: property.location,
          address: property.address,
          bedrooms: String(property.bedrooms || ''),
          bathrooms: String(property.bathrooms || ''),
          area: String(property.area || ''),
          images: property.images || [],
          amenities: property.amenities || [],
        });
      } catch (err) {
        setSubmitMessage(err instanceof Error ? err.message : 'Failed to load property');
      }
    };

    loadProperty();
  }, [editingId]);

  const convertImageToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(file);
    });

  const calculatePrice = () => {
    const amount = Number(formData.price);
    if (formData.priceUnit === 'cr') return amount * 10000000;
    if (formData.priceUnit === 'lac') return amount * 100000;
    return amount;
  };

  const validateTitle = useCallback((title: string): string => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return 'Property title is required';
    if (cleanTitle.length < MIN_TITLE_LENGTH) return `Title should be at least ${MIN_TITLE_LENGTH} characters`;
    if (cleanTitle.length > MAX_TITLE_LENGTH) return `Title cannot exceed ${MAX_TITLE_LENGTH} characters`;
    if (/^\d+$/.test(cleanTitle)) return 'Title cannot contain only numbers';
    return '';
  }, []);

  const validateDescription = useCallback((desc: string): string => {
    const cleanDesc = desc.trim();
    if (!cleanDesc) return 'Description is required';
    if (cleanDesc.length < MIN_DESCRIPTION_LENGTH) return `Description should be at least ${MIN_DESCRIPTION_LENGTH} characters`;
    if (cleanDesc.length > MAX_DESCRIPTION_LENGTH) return `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    return '';
  }, []);

  const validateAddress = useCallback((addr: string): string => {
    const cleanAddr = addr.trim();
    if (!cleanAddr) return 'Address is required';
    if (cleanAddr.length < MIN_ADDRESS_LENGTH) return `Address should be at least ${MIN_ADDRESS_LENGTH} characters`;
    if (cleanAddr.length > MAX_ADDRESS_LENGTH) return `Address cannot exceed ${MAX_ADDRESS_LENGTH} characters`;
    return '';
  }, []);

  const validatePrice = useCallback((val: string): string => {
    if (!val) return 'Price is required';
    const parsed = parseFloat(val);
    if (Number.isNaN(parsed) || parsed <= 0) return 'Price must be a positive number greater than 0';
    return '';
  }, []);

  const validateArea = useCallback((val: string): string => {
    if (!val) return 'Area is required';
    const parsed = parseFloat(val);
    if (Number.isNaN(parsed) || parsed <= 0) return 'Area must be greater than 0';
    if (parsed >= 100000) return 'Area configuration must be less than 100,000 sq.ft.';
    return '';
  }, []);

  const validateBedroomsBathrooms = useCallback((val: string, label: string): string => {
    if (formData.propertyType === 'land' || formData.propertyType === 'commercial') return '';
    if (!val) return `${label} is required`;
    const parsed = parseInt(val, 10);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 20) return `${label} counter scope must range between 0 and 20`;
    return '';
  }, [formData.propertyType]);

  const runFieldValidation = useCallback((name: string, value: string): string => {
    switch (name) {
      case 'title':
        return validateTitle(value);
      case 'description':
        return validateDescription(value);
      case 'address':
        return validateAddress(value);
      case 'price':
        return validatePrice(value);
      case 'area':
        return validateArea(value);
      case 'bedrooms':
        return validateBedroomsBathrooms(value, 'Bedrooms');
      case 'bathrooms':
        return validateBedroomsBathrooms(value, 'Bathrooms');
      default:
        return '';
    }
  }, [validateTitle, validateDescription, validateAddress, validatePrice, validateArea, validateBedroomsBathrooms]);

  const handleBlur = (name: string) => {
    setTouchedFields(prev => new Set(prev).add(name));
    setErrors(prev => ({ ...prev, [name]: runFieldValidation(name, String(formData[name as keyof FormData] || '')) }));
  };

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touchedFields.has(name)) {
      setErrors(prev => ({ ...prev, [name]: runFieldValidation(name, value) }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const picked = Array.from(files);
    const oversized = picked.filter((f) => f.size > MAX_FILE_SIZE_BYTES);
    if (oversized.length) {
      setSubmitMessage('One or more images exceed file bounds. Please upload images smaller than 2MB each.');
      return;
    }

    if (formData.images.length + picked.length > MAX_IMAGE_COUNT) {
      setSubmitMessage(`Maximum payload capacity bound. You cannot exceed ${MAX_IMAGE_COUNT} total property images.`);
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...picked] }));
    setSubmitMessage('');
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const toggleAmenity = (amenity: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {
      title: validateTitle(formData.title),
      description: validateDescription(formData.description)
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.description;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {
      price: validatePrice(formData.price),
      address: validateAddress(formData.address),
      area: validateArea(formData.area),
      bedrooms: validateBedroomsBathrooms(formData.bedrooms, 'Bedrooms'),
      bathrooms: validateBedroomsBathrooms(formData.bathrooms, 'Bathrooms')
    };
    setErrors(newErrors);
    return !newErrors.price && !newErrors.address && !newErrors.area && !newErrors.bedrooms && !newErrors.bathrooms;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentStep !== 3) return;

    setTouchedFields(new Set(['title', 'description', 'price', 'address', 'area', 'bedrooms', 'bathrooms']));
    
    if (!validateStep1() || !validateStep2()) {
      setSubmitMessage('Validation checks triggered. Please ensure all workflow steps are complete.');
      return;
    }

    if (formData.images.length < 1) {
      setSubmitMessage('Image requirement context failure. Please attach at least one valid property image.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const imageUrls = await Promise.all(
        formData.images.map((image) =>
          typeof image === 'string' ? image : convertImageToDataUrl(image)
        )
      );

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: calculatePrice(),
        location: formData.location,
        address: formData.address.trim(),
        propertyType: formData.propertyType,
        listingType: formData.listingType,
        bedrooms: Number(formData.bedrooms || 0),
        bathrooms: Number(formData.bathrooms || 0),
        area: Number(formData.area || 0),
        amenities: formData.amenities,
        images: imageUrls,
        featured: false,
      };

      if (editingId) {
        await api.updateProperty(editingId, payload);
      } else {
        await api.createProperty(payload);
      }

      navigate('/dashboard');
    } catch (err) {
      setSubmitMessage(err instanceof Error ? err.message : 'Failed to save property context profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center pt-24 text-walnut-600">Loading...</div>;
  }

  if (!user || user.role !== 'realtor') {
    return <div className="min-h-screen pt-24 text-center"><button onClick={() => navigate('/access-denied')} className="text-red-600 font-bold">Access Denied</button></div>;
  }

  return (
    <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl lg:text-4xl font-serif font-bold text-walnut-800 mb-3">
            {editingId ? 'Edit Property' : 'List Your Property'}
          </h1>
          <p className="text-walnut-600 max-w-xl mx-auto">
            {editingId
              ? 'Update your property details to keep your listing accurate.'
              : 'Fill in the details below to list your property on KeralaEstates and reach thousands of potential buyers.'}
          </p>
        </div>

        {/* Form Steps Progress Architecture Bar */}
        <div className="flex items-center justify-center mb-10">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  currentStep >= step
                    ? 'bg-teak-600 text-cream-50'
                    : 'bg-walnut-100 text-walnut-500'
                }`}
              >
                {currentStep > step ? <Check className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-20 lg:w-32 h-1 mx-2 rounded transition-colors ${
                  currentStep > step ? 'bg-teak-600' : 'bg-walnut-100'
                }`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {submitMessage && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{submitMessage}</span>
            </div>
          )}

          {/* STEP 1: BASIC DETAILS */}
          {currentStep === 1 && (
            <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100 space-y-6">
              <h2 className="text-xl font-semibold text-walnut-800 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-teak-600" />
                Basic Details
              </h2>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-walnut-700">
                    Property Title *
                  </label>
                  <span className="text-xs text-walnut-500 font-mono">
                    {formData.title.trim().length} / {MAX_TITLE_LENGTH}
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  onBlur={() => handleBlur('title')}
                  placeholder="e.g., Sky Villa"
                  className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${
                    errors.title ? 'border-red-300' : 'border-walnut-200'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-walnut-700">
                    Description *
                  </label>
                  <span className="text-xs text-walnut-500 font-mono">
                    {formData.description.trim().length} / {MAX_DESCRIPTION_LENGTH}
                  </span>
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  onBlur={() => handleBlur('description')}
                  rows={5}
                  placeholder="Describe your property's unique features, location benefits, and premium specs..."
                  className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 resize-none ${
                    errors.description ? 'border-red-300' : 'border-walnut-200'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-walnut-700 mb-3">
                    Property Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { type: 'villa', icon: Home },
                      { type: 'apartment', icon: Building2 },
                      { type: 'commercial', icon: Home },
                      { type: 'land', icon: MapPin },
                    ].map(({ type, icon: Icon }) => (
                      <label
                        key={type}
                        className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all ${
                          formData.propertyType === type
                            ? 'bg-teak-600 text-cream-50 border-teak-600'
                            : 'bg-walnut-50 text-walnut-600 border-walnut-200 hover:bg-walnut-100'
                        } border`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium capitalize text-sm">{type}</span>
                        <input
                          type="radio"
                          name="propertyType"
                          checked={formData.propertyType === type}
                          onChange={() => setFormData(prev => ({ ...prev, propertyType: type as any }))}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-walnut-700 mb-3">
                    Listing Type *
                  </label>
                  <div className="flex gap-3">
                    {['sale', 'rent'].map((type) => (
                      <label
                        key={type}
                        className={`flex-1 p-3 rounded-xl cursor-pointer transition-all text-center font-medium ${
                          formData.listingType === type
                            ? 'bg-teak-600 text-cream-50 border-teak-600'
                            : 'bg-walnut-50 text-walnut-600 border-walnut-200 hover:bg-walnut-100'
                        } border`}
                      >
                        For {type.charAt(0).toUpperCase() + type.slice(1)}
                        <input
                          type="radio"
                          name="listingType"
                          checked={formData.listingType === type}
                          onChange={() => setFormData(prev => ({ ...prev, listingType: type as any }))}
                          className="sr-only"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LOCATION & PRICING */}
          {currentStep === 2 && (
            <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100 space-y-6">
              <h2 className="text-xl font-semibold text-walnut-800 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teak-600" />
                Location & Pricing
              </h2>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-walnut-700 mb-2">
                    Price *
                  </label>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type="text"
                        value={formData.price}
                        onChange={(e) => handleChange('price', e.target.value.replace(/[^0-9]/g, ''))}
                        onBlur={() => handleBlur('price')}
                        placeholder="Enter amount"
                        className={`w-full pl-10 pr-4 py-3 bg-walnut-50 border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 ${
                          errors.price ? 'border-red-300' : 'border-walnut-200'
                        }`}
                      />
                    </div>
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => setFormData(prev => ({ ...prev, priceUnit: e.target.value as any }))}
                      className="px-4 py-3 bg-walnut-50 border border-walnut-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 cursor-pointer"
                    >
                      <option value="lac">Lac</option>
                      <option value="cr">Cr</option>
                      <option value="month">/Month</option>
                    </select>
                  </div>
                  {errors.price && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-walnut-700 mb-2">
                    Location *
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-4 py-3 bg-walnut-50 border border-walnut-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 cursor-pointer"
                  >
                    {locations.slice(1).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-walnut-700">
                    Full Address *
                  </label>
                  <span className="text-xs text-walnut-500 font-mono">
                    {formData.address.trim().length} / {MAX_ADDRESS_LENGTH}
                  </span>
                </div>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  rows={2}
                  placeholder="Complete postal address context details with landmarks..."
                  className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 resize-none ${
                    errors.address ? 'border-red-300' : 'border-walnut-200'
                  }`}
                />
                {errors.address && (
                  <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.address}
                  </p>
                )}
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-walnut-700 mb-2">
                    Built-up Area (sq.ft.) *
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value.replace(/[^0-9]/g, ''))}
                    onBlur={() => handleBlur('area')}
                    placeholder="e.g., 2500"
                    className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 ${
                      errors.area ? 'border-red-300' : 'border-walnut-200'
                    }`}
                  />
                  {errors.area && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.area}
                    </p>
                  )}
                </div>

                {formData.propertyType !== 'land' && formData.propertyType !== 'commercial' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-walnut-700 mb-2">
                        Bedrooms *
                      </label>
                      <input
                        type="number"
                        value={formData.bedrooms}
                        onChange={(e) => handleChange('bedrooms', e.target.value)}
                        onBlur={() => handleBlur('bedrooms')}
                        min="0"
                        max="20"
                        placeholder="e.g., 3"
                        className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 ${
                          errors.bedrooms ? 'border-red-300' : 'border-walnut-200'
                        }`}
                      />
                      {errors.bedrooms && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.bedrooms}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-walnut-700 mb-2">
                        Bathrooms *
                      </label>
                      <input
                        type="number"
                        value={formData.bathrooms}
                        onChange={(e) => handleChange('bathrooms', e.target.value)}
                        onBlur={() => handleBlur('bathrooms')}
                        min="0"
                        max="20"
                        placeholder="e.g., 2"
                        className={`w-full px-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 ${
                          errors.bathrooms ? 'border-red-300' : 'border-walnut-200'
                        }`}
                      />
                      {errors.bathrooms && (
                        <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.bathrooms}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: IMAGES & AMENITIES */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-walnut-800 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-teak-600" />
                    Property Images *
                  </h2>
                  <span className="text-xs font-semibold text-walnut-500 font-mono">
                    {formData.images.length} / {MAX_IMAGE_COUNT}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-walnut-100">
                      <img
                        src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {formData.images.length < MAX_IMAGE_COUNT && (
                    <label className="aspect-square rounded-xl border-2 border-dashed border-walnut-300 flex flex-col items-center justify-center cursor-pointer hover:border-teak-400 transition-colors bg-walnut-50/50 p-2 text-center">
                      <Upload className="w-7 h-7 text-walnut-400 mb-1" />
                      <span className="text-[11px] font-semibold text-walnut-500">Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="bg-cream-50 rounded-2xl p-6 lg:p-8 shadow-sm border border-walnut-100">
                <h2 className="text-xl font-semibold text-walnut-800 mb-6 flex items-center gap-2">
                  <Check className="w-5 h-5 text-teak-600" />
                  Amenities & Features
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allAmenities.map((amenity) => (
                    <label
                      key={amenity}
                      onClick={(e) => e.stopPropagation()} 
                      className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all border select-none ${
                        formData.amenities.includes(amenity)
                          ? 'bg-teak-50 border-teak-300 text-teak-700 font-medium'
                          : 'bg-walnut-50 border-walnut-200 text-walnut-600 hover:bg-walnut-100'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.amenities.includes(amenity)}
                        onChange={(e) => toggleAmenity(amenity, e)}
                        className="accent-teak-600 w-4 h-4 rounded"
                      />
                      <span className="text-xs">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Wizard Form Progression Control Row */}
          <div className="flex justify-between pt-6 border-t border-walnut-100/50">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentStep(prev => prev - 1); }} type="button">
                Previous
              </Button>
            ) : (
              <div />
            )}

            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (currentStep === 1 && validateStep1()) setCurrentStep(2);
                  else if (currentStep === 2 && validateStep2()) setCurrentStep(3);
                }}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                {editingId ? 'Update Property' : 'List Property'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;