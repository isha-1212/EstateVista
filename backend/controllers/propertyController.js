import { db } from '../config/firebase.js';

const normalizeList = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const parseNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const getRealtor = async (realtorId) => {
  if (!realtorId) {
    return {
      id: '',
      name: 'Realtor',
      email: '',
      phone: '',
      avatar: '',
    };
  }

  const snapshot = await db.ref(`users/${realtorId}`).get();
  const user = snapshot.exists() ? snapshot.val() : {};
  return {
    id: realtorId,
    name: user.name || 'Realtor',
    email: user.email || '',
    phone: user.phone || '',
    avatar: user.avatar || '',
  };
};

const withRealtor = async (id, property) => ({
  id,
  ...property,
  amenities: normalizeList(property.amenities),
  images: normalizeList(property.images),
  featured: Boolean(property.featured),
  realtor: await getRealtor(property.realtorId),
});

// GET /api/properties - Get server-side filtered, searched, and paginated properties
export const getAllProperties = async (req, res) => {
  try {
    const {
      search = '',
      location = 'All Locations',
      propertyType = '',
      listingType = 'all',
      priceMin,
      priceMax,
      bedrooms,
      page = 1,
      limit = 6,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10));
    const parsedLimit = Math.max(1, parseInt(limit, 10));

    const snapshot = await db.ref('properties').get();

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: {
          properties: [],
          totalCount: 0,
          currentPage: parsedPage,
          totalPages: 0,
        },
      });
    }

    let propertiesList = [];
    snapshot.forEach((childSnapshot) => {
      propertiesList.push({
        id: childSnapshot.key,
        ...childSnapshot.val(),
      });
    });

    // Apply Server-side filtering logic
    if (search) {
      const q = search.toLowerCase();
      propertiesList = propertiesList.filter((p) =>
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q))
      );
    }

    if (location && location !== 'All Locations') {
      propertiesList = propertiesList.filter((p) => p.location === location);
    }

    if (propertyType) {
      propertiesList = propertiesList.filter((p) => p.propertyType === propertyType);
    }

    if (listingType && listingType !== 'all') {
      propertiesList = propertiesList.filter((p) => p.listingType === listingType);
    }

    if (priceMin !== undefined && priceMin !== '') {
      const minP = parseFloat(priceMin);
      propertiesList = propertiesList.filter((p) => p.price >= minP);
    }

    if (priceMax !== undefined && priceMax !== '') {
      const maxP = parseFloat(priceMax);
      propertiesList = propertiesList.filter((p) => p.price <= maxP);
    }

    if (bedrooms !== undefined && bedrooms !== '' && parseInt(bedrooms, 10) !== 0) {
      const beds = parseInt(bedrooms, 10);
      propertiesList = propertiesList.filter((p) => p.bedrooms >= beds);
    }

    // Sort chronologically by default
    propertiesList.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));

    const totalCount = propertiesList.length;
    const totalPages = Math.ceil(totalCount / parsedLimit);
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedItems = propertiesList.slice(startIndex, startIndex + parsedLimit);

    const propertiesWithRealtors = await Promise.all(
      paginatedItems.map((property) => withRealtor(property.id, property))
    );

    res.status(200).json({
      success: true,
      data: {
        properties: propertiesWithRealtors,
        totalCount,
        currentPage: parsedPage,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Get properties server error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch properties from server: ' + error.message,
    });
  }
};

// GET /api/properties/:id - Get single property (public)
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const snapshot = await db.ref(`properties/${id}`).get();

    if (!snapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      data: await withRealtor(snapshot.key, snapshot.val()),
    });
  } catch (error) {
    console.error('Get property error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to fetch property: ' + error.message,
    });
  }
};

// POST /api/properties - Create property (Protected)
export const createProperty = async (req, res) => {
  try {
    const { title, description, price, location, address, propertyType, listingType, bedrooms, bathrooms, area, amenities, images, featured } = req.body;
    const realtorId = req.user.uid;

    if (!title || !description || !price || !location || !address || !propertyType || !listingType) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields',
      });
    }

    if (!['apartment', 'villa', 'commercial', 'land'].includes(propertyType)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid property type',
      });
    }

    if (!['rent', 'sale'].includes(listingType)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid listing type',
      });
    }

    const propertyData = {
      title,
      description,
      price: parseNumber(price),
      location,
      address,
      propertyType,
      listingType,
      bedrooms: parseNumber(bedrooms),
      bathrooms: parseNumber(bathrooms),
      area: parseNumber(area),
      amenities: normalizeList(amenities),
      images: normalizeList(images),
      featured: Boolean(featured),
      realtorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPropertyRef = await db.ref('properties').push(propertyData);

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      propertyId: newPropertyRef.key,
      data: await withRealtor(newPropertyRef.key, propertyData),
    });
  } catch (error) {
    console.error('Create property error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to create property: ' + error.message,
    });
  }
};

// PUT /api/properties/:id - Update property (Protected)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, location, address, propertyType, listingType, bedrooms, bathrooms, area, amenities, images, featured } = req.body;
    const realtorId = req.user.uid;

    const snapshot = await db.ref(`properties/${id}`).get();
    if (!snapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'Property not found',
      });
    }

    const property = snapshot.val();
    if (property.realtorId !== realtorId) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to update this property',
      });
    }

    const updateData = {
      title: title ?? property.title,
      description: description ?? property.description,
      price: price !== undefined ? parseFloat(price) : property.price,
      location: location ?? property.location,
      address: address ?? property.address,
      propertyType: propertyType ?? property.propertyType,
      listingType: listingType ?? property.listingType,
      bedrooms: bedrooms !== undefined ? parseInt(bedrooms, 10) : property.bedrooms,
      bathrooms: bathrooms !== undefined ? parseNumber(bathrooms) : property.bathrooms,
      area: area !== undefined ? parseNumber(area) : property.area,
      amenities: amenities !== undefined ? normalizeList(amenities) : normalizeList(property.amenities),
      images: images !== undefined ? normalizeList(images) : normalizeList(property.images),
      featured: featured !== undefined ? Boolean(featured) : Boolean(property.featured),
      updatedAt: new Date().toISOString(),
    };

    await db.ref(`properties/${id}`).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: await withRealtor(id, { ...property, ...updateData }),
    });
  } catch (error) {
    console.error('Update property error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to update property: ' + error.message,
    });
  }
};

// DELETE /api/properties/:id - Delete property (Protected)
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const realtorId = req.user.uid;

    const snapshot = await db.ref(`properties/${id}`).get();
    if (!snapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'Property not found',
      });
    }

    const property = snapshot.val();
    if (property.realtorId !== realtorId) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to delete this property',
      });
    }

    await db.ref(`properties/${id}`).remove();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    console.error('Delete property error:', error.message);
    res.status(500).json({
      error: true,
      message: 'Failed to delete property: ' + error.message,
    });
  }
};