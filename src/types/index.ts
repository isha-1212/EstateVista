export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  address: string;
  propertyType: 'apartment' | 'villa' | 'commercial' | 'land';
  listingType: 'rent' | 'sale';
  bedrooms: number;
  bathrooms: number;
  area: number;
  images: string[];
  amenities: string[];
  realtor: Realtor;
  featured: boolean;
  createdAt: string;
}

export interface Realtor {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  realtorId?: string;
  buyerId?: string;
  status: 'new' | 'contacted' | 'closed' | 'replied';
  createdAt: string;

  reply?: string;
  replySubject?: string;
  replyDate?: string;
  realtorName?: string;
}

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'realtor';
  text: string;
  timestamp: string;
}

export interface ChatChannel {
  id: string;
  inquiryId: string;
  propertyId: string;
  propertyTitle: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  realtorId: string;
  realtorName: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCountByRole?: {
    user: number;
    realtor: number;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'realtor';
  avatar: string;
}

export interface FilterOptions {
  search?: string;
  location?: string;
  propertyType?: string;
  listingType?: 'rent' | 'sale' | 'all';
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedPropertiesResponse {
  properties: Property[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}