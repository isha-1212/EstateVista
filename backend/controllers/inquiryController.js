import { db } from '../config/firebase.js';

// Create new inquiry
export const createInquiry = async (req, res) => {
  try {
    const { name, email, phone, message, propertyId, buyerId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message || !propertyId) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: name, email, phone, message, propertyId',
      });
    }

    // Get property details to get property title and realtor ID
    const propertySnapshot = await db.ref(`properties/${propertyId}`).get();
    if (!propertySnapshot.exists()) {
      return res.status(404).json({
        error: true,
        message: 'Property not found',
      });
    }

    const property = propertySnapshot.val();
    const resolvedRealtorId = property.realtorId || (property.realtor && property.realtor.id) || '';

    // Create inquiry object
    const inquiryData = {
      name,
      email,
      phone,
      message,
      propertyId,
      propertyTitle: property.title,
      realtorId: resolvedRealtorId,
      buyerId: buyerId || '', // Binds explicit reference mapping back into the tracking infrastructure to align real-time channels
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    // Push to database
    const newInquiryRef = await db.ref('inquiries').push(inquiryData);

    return res.status(201).json({
      success: true,
      message: 'Inquiry sent successfully',
      inquiryId: newInquiryRef.key,
      data: {
        ...inquiryData,
        id: newInquiryRef.key,
        realtorName: property.realtor?.name || 'Verified Realtor'
      }
    });
  } catch (error) {
    console.error('Create inquiry error:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to create inquiry: ' + error.message,
    });
  }
};

// Get all inquiries for realtor (Protected)
export const getInquiries = async (req, res) => {
  try {
    const realtorId = req.user.uid;

    // NOTE: Avoid Realtime Database index requirement errors by fetching then filtering.
    const snapshot = await db.ref('inquiries').get();

    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const inquiries = [];
    snapshot.forEach((childSnapshot) => {
      const inquiry = childSnapshot.val();
      const id = childSnapshot.key;

      // Security: realtor can only see inquiries that belong to their listings.
      if (inquiry?.realtorId !== realtorId) return;

      inquiries.push({
        id,
        ...inquiry,
      });
    });

    // Sort by date (newest first)
    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('Get inquiries error:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch inquiries: ' + error.message,
    });
  }
};

// Helper: validate realtor owns inquiry's property (best-effort)
const assertRealtorOwnsInquiry = async (inquiryId, realtorId) => {
  const inquirySnap = await db.ref(`inquiries/${inquiryId}`).get();
  if (!inquirySnap.exists()) return { inquiry: null, notFound: true };
  const inquiry = inquirySnap.val();

  // Prefer stored realtorId on inquiry
  if (inquiry?.realtorId && inquiry.realtorId === realtorId) {
    return { inquiry, notFound: false };
  }

  // Fallback: verify via property
  if (inquiry?.propertyId) {
    const propertySnap = await db.ref(`properties/${inquiry.propertyId}`).get();
    const property = propertySnap.exists() ? propertySnap.val() : null;
    if (property && (property.realtorId === realtorId || (property.realtor && property.realtor.id === realtorId))) {
      return { inquiry, notFound: false };
    }
  }

  return { inquiry, notFound: false, unauthorized: true };
};

// PUT /api/inquiries/:id/status - update inquiry status to contacted/closed/replied
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const realtorId = req.user.uid;

    const allowed = ['new', 'contacted', 'closed', 'replied'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        error: true,
        message: 'Invalid inquiry status',
      });
    }

    const { inquiry, unauthorized, notFound } = await assertRealtorOwnsInquiry(id, realtorId);
    if (notFound || !inquiry) {
      return res.status(404).json({
        error: true,
        message: 'Inquiry not found',
      });
    }
    if (unauthorized) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to update this inquiry',
      });
    }

    await db.ref(`inquiries/${id}`).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Inquiry status updated',
      data: { id, status },
    });
  } catch (error) {
    console.error('updateInquiryStatus error:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to update inquiry status: ' + error.message,
    });
  }
};

// POST /api/inquiries/:id/reply - store reply + mark replied
export const replyInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipientEmail, subject, message } = req.body;
    const realtorId = req.user.uid;

    if (!recipientEmail || !subject || !message) {
      return res.status(400).json({
        error: true,
        message: 'Missing required fields: recipientEmail, subject, message',
      });
    }

    const { inquiry, unauthorized, notFound } = await assertRealtorOwnsInquiry(id, realtorId);
    if (notFound || !inquiry) {
      return res.status(404).json({
        error: true,
        message: 'Inquiry not found',
      });
    }
    if (unauthorized) {
      return res.status(403).json({
        error: true,
        message: 'Not authorized to reply to this inquiry',
      });
    }

    // Fetch realtor details for filling realtorName
    let realtorName = 'Verified Realtor';
    const realtorSnap = await db.ref(`users/${realtorId}`).get();
    if (realtorSnap.exists()) {
      const realtorData = realtorSnap.val();
      if (realtorData.name) {
        realtorName = realtorData.name;
      }
    }

    const nowStr = new Date().toISOString();

    await db.ref(`inquiries/${id}`).update({
      status: 'replied',
      reply: message,
      replySubject: subject,
      replyDate: nowStr,
      realtorName: realtorName,
      updatedAt: nowStr,
    });

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      data: { id },
    });
  } catch (error) {
    console.error('replyInquiry error:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to send reply: ' + error.message,
    });
  }
};

// GET /api/inquiries/user-history - Get logged-in buyer's inquiries
export const getLoggedInUserInquiries = async (req, res) => {
  try {
    const userEmail = req.user.email;

    if (!userEmail) {
      return res.status(400).json({
        error: true,
        message: 'User token does not contain a valid email address',
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
      const inquiry = childSnapshot.val();
      const id = childSnapshot.key;

      if (inquiry?.email && inquiry.email.toLowerCase() === userEmail.toLowerCase()) {
        inquiries.push({
          id,
          ...inquiry,
        });
      }
    });

    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error('getLoggedInUserInquiries error:', error.message);
    return res.status(500).json({
      error: true,
      message: 'Failed to fetch user inquiries: ' + error.message,
    });
  }
};

// -------------------------
// Buyer endpoints (Protected legacy)
// -------------------------

const getUserEmail = async (userId) => {
  const snap = await db.ref(`users/${userId}/email`).get();
  if (!snap.exists()) return '';
  return snap.val();
};

const hydrateInquiryWithProperty = async (inquiry) => {
  try {
    const propertySnap = await db.ref(`properties/${inquiry.propertyId}`).get();
    if (!propertySnap.exists()) return inquiry;
    const property = propertySnap.val();

    return {
      ...inquiry,
      property: {
        id: inquiry.propertyId,
        title: property.title,
        price: property.price,
        location: property.location,
        propertyType: property.propertyType,
        images: Array.isArray(property.images) ? property.images : [],
        realtorId: property.realtorId,
      },
    };
  } catch {
    return inquiry;
  }
};

export const getUserInquiries = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = await getUserEmail(userId);

    if (!userEmail) {
      return res.status(200).json({ success: true, data: [] });
    }

    const snapshot = await db.ref('inquiries').get();
    if (!snapshot.exists()) {
      return res.status(200).json({ success: true, data: [] });
    }

    const inquiries = [];
    snapshot.forEach((childSnapshot) => {
      const inquiry = childSnapshot.val();
      const id = childSnapshot.key;
      if (inquiry?.email !== userEmail) return;
      inquiries.push({ id, ...inquiry });
    });

    inquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const hydrated = await Promise.all(inquiries.map(hydrateInquiryWithProperty));
    return res.status(200).json({ success: true, data: hydrated });
  } catch (error) {
    console.error('getUserInquiries error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch user inquiries' });
  }
};

export const getUserInquiryById = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = await getUserEmail(userId);

    const { id } = req.params;
    const inquirySnap = await db.ref(`inquiries/${id}`).get();
    if (!inquirySnap.exists()) {
      return res.status(404).json({ error: true, message: 'Inquiry not found' });
    }

    const inquiry = inquirySnap.val();
    if (!userEmail || inquiry?.email !== userEmail) {
      return res.status(403).json({ error: true, message: 'Not authorized' });
    }

    const hydrated = await hydrateInquiryWithProperty({ id, ...inquiry });
    return res.status(200).json({ success: true, data: hydrated });
  } catch (error) {
    console.error('getUserInquiryById error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch inquiry' });
  }
};

export const getUserReplies = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = await getUserEmail(userId);
    if (!userEmail) return res.status(200).json({ success: true, data: [] });

    const snapshot = await db.ref('inquiries').get();
    if (!snapshot.exists()) return res.status(200).json({ success: true, data: [] });

    const replied = [];
    snapshot.forEach((childSnapshot) => {
      const inquiry = childSnapshot.val();
      const id = childSnapshot.key;
      if (inquiry?.email !== userEmail) return;
      if (!inquiry?.reply) return;
      replied.push({ id, ...inquiry });
    });

    replied.sort((a, b) =>
      new Date(b.replyDate || b.updatedAt || b.createdAt).getTime() -
      new Date(a.replyDate || a.updatedAt || a.createdAt).getTime()
    );

    const hydrated = await Promise.all(replied.map(hydrateInquiryWithProperty));
    return res.status(200).json({ success: true, data: hydrated });
  } catch (error) {
    console.error('getUserReplies error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch replies' });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = await getUserEmail(userId);

    if (!userEmail) {
      return res.status(200).json({
        success: true,
        data: { totalInquiries: 0, repliesReceived: 0, pendingResponses: 0, savedProperties: 0 },
      });
    }

    const snapshot = await db.ref('inquiries').get();
    if (!snapshot.exists()) {
      return res.status(200).json({
        success: true,
        data: { totalInquiries: 0, repliesReceived: 0, pendingResponses: 0, savedProperties: 0 },
      });
    }

    let totalInquiries = 0;
    let repliesReceived = 0;
    let pendingResponses = 0;

    snapshot.forEach((childSnapshot) => {
      const inquiry = childSnapshot.val();
      if (inquiry?.email !== userEmail) return;

      const status = inquiry?.status;

      totalInquiries += 1;
      if (inquiry?.reply) repliesReceived += 1;
      if (status === 'new' || status === 'contacted') pendingResponses += 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        totalInquiries,
        repliesReceived,
        pendingResponses,
        savedProperties: 0,
      },
    });
  } catch (error) {
    console.error('getUserStats error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch user stats' });
  }
};

export const getRecommendedProperties = async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = await getUserEmail(userId);
    if (!userEmail) return res.status(200).json({ success: true, data: [] });

    const [propertiesSnap, inquiriesSnap] = await Promise.all([
      db.ref('properties').get(),
      db.ref('inquiries').get(),
    ]);

    if (!propertiesSnap.exists()) return res.status(200).json({ success: true, data: [] });

    const properties = [];
    propertiesSnap.forEach((child) => properties.push({ id: child.key, ...child.val() }));

    const locationCounts = new Map();
    const typeCounts = new Map();
    const visitedPropertyIds = new Set();

    if (inquiriesSnap.exists()) {
      inquiriesSnap.forEach((child) => {
        const inquiry = child.val();
        if (inquiry?.email !== userEmail) return;

        if (inquiry?.propertyId) visitedPropertyIds.add(inquiry.propertyId);

        const p = properties.find((x) => x.id === inquiry?.propertyId);
        if (!p) return;

        if (p.location) locationCounts.set(p.location, (locationCounts.get(p.location) || 0) + 1);
        if (p.propertyType) typeCounts.set(p.propertyType, (typeCounts.get(p.propertyType) || 0) + 1);
      });
    }

    const topLocation = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const topType = [...typeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    const scored = properties
      .filter((p) => !visitedPropertyIds.has(p.id))
      .map((p) => {
        let score = 0;
        if (topLocation && p.location === topLocation) score += 3;
        if (topType && p.propertyType === topType) score += 2;
        if (p.featured) score += 0.5;
        return { p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(({ p }) => p);

    return res.status(200).json({ success: true, data: scored });
  } catch (error) {
    console.error('getRecommendedProperties error:', error.message);
    return res.status(500).json({ error: true, message: 'Failed to fetch recommended properties' });
  }
};