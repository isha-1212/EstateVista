import { db } from '../config/firebase.js';

const normalizeInquiry = (id, val) => ({
  id,
  ...val,
  propertyId: val.propertyId,
  propertyTitle: val.propertyTitle,
  realtorId: val.realtorId,
});

const getPropertyAndValidateOwnership = async (propertyId, realtorId) => {
  const snapshot = await db.ref(`properties/${propertyId}`).get();
  if (!snapshot.exists()) {
    return { property: null };
  }
  const property = snapshot.val();
  if (property.realtorId !== realtorId) {
    return { property: null, unauthorized: true };
  }
  return { property, unauthorized: false };
};

// PUT /api/property-owner/properties/:id/status
export const updatePropertyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected: "active" | "sold" | "rented"
    const realtorId = req.user.uid;

    const allowed = ['active', 'sold', 'rented'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid status. Use active | sold | rented',
      });
    }

    const { property, unauthorized } = await getPropertyAndValidateOwnership(id, realtorId);
    if (!property) {
      return res.status(404).json({
        error: true,
        message: unauthorized ? 'Not authorized to update this property' : 'Property not found',
      });
    }

    await db.ref(`properties/${id}`).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Property status updated successfully',
      data: { status },
    });
  } catch (err) {
    console.error('updatePropertyStatus error:', err.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to update property status: ' + err.message,
    });
  }
};

// GET /api/property-owner/properties/:id/inquiries
export const getPropertyInquiries = async (req, res) => {
  try {
    const { id } = req.params;
    const realtorId = req.user.uid;

    const { property, unauthorized } = await getPropertyAndValidateOwnership(id, realtorId);
    if (!property) {
      return res.status(404).json({
        error: true,
        message: unauthorized ? 'Not authorized to view inquiries' : 'Property not found',
      });
    }

    const snapshot = await db.ref('inquiries').get();
    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const inquiries = [];
    snapshot.forEach((childSnapshot) => {
      const val = childSnapshot.val();
      if (val?.propertyId === id && val?.realtorId === realtorId) {
        inquiries.push(normalizeInquiry(childSnapshot.key, val));
      }
    });

    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (err) {
    console.error('getPropertyInquiries error:', err.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch property inquiries: ' + err.message,
    });
  }
};

// GET /api/property-owner/properties/:id/stats
export const getPropertyStats = async (req, res) => {
  try {
    const { id } = req.params;
    const realtorId = req.user.uid;

    const { property, unauthorized } = await getPropertyAndValidateOwnership(id, realtorId);
    if (!property) {
      return res.status(404).json({
        error: true,
        message: unauthorized ? 'Not authorized to view property stats' : 'Property not found',
      });
    }

    // Views: project currently has no views tracking in DB.
    // We'll return 0 for now unless views are stored under properties/{id}.viewsCount
    const viewsCount = typeof property.viewsCount === 'number' ? property.viewsCount : 0;

    // Total inquiries: count inquiries where propertyId matches
    const snapshot = await db.ref('inquiries').get();
    let inquiriesCount = 0;
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const val = childSnapshot.val();
        if (val?.propertyId === id && val?.realtorId === realtorId) {
          inquiriesCount += 1;
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        viewsCount,
        inquiriesCount,
      },
    });
  } catch (err) {
    console.error('getPropertyStats error:', err.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch property stats: ' + err.message,
    });
  }
};

