import { auth } from '../firebaseClient';
import { Property, Inquiry, User, FilterOptions, PaginatedPropertiesResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  user?: User;
  token?: string;
  propertyId?: string;
  inquiryId?: string;
  error?: boolean;
}

const getAuthToken = async () => {
  const token = await auth?.currentUser?.getIdToken?.();
  return token || localStorage.getItem('token');
};

const request = async <T>(path: string, options: RequestInit = {}, requiresAuth = false) => {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = await getAuthToken();
    if (!token) {
      throw new Error('Please login first');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = (await response.json()) as ApiResponse<T>;
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

export const api = {
  signup: (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'user' | 'realtor';
  }) =>
    request<User>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (idToken: string) =>
    request<User>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    }),

  me: () => request<User>('/api/users/me', {}, true),

  getProperties: (filters?: FilterOptions) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }
    const queryString = params.toString();
    return request<PaginatedPropertiesResponse>(`/api/properties${queryString ? `?${queryString}` : ''}`);
  },

  getProperty: (id: string) => request<Property>(`/api/properties/${id}`),

  createProperty: (payload: Omit<Property, 'id' | 'realtor' | 'createdAt'>) =>
    request<Property>('/api/properties', {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  updateProperty: (id: string, payload: Partial<Property>) =>
    request<Property>(`/api/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }, true),

  deleteProperty: (id: string) =>
    request<void>(`/api/properties/${id}`, {
      method: 'DELETE',
    }, true),

  createInquiry: (payload: Omit<Inquiry, 'id' | 'propertyTitle' | 'status' | 'createdAt'>) =>
    request<void>('/api/inquiries', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getInquiries: () => request<Inquiry[]>('/api/inquiries', {}, true),

  getUserInquiries: () => request<Inquiry[]>('/api/inquiries/user-history', {}, true),

  updateInquiryStatus: (inquiryId: string, status: 'new' | 'contacted' | 'closed' | 'replied') =>
    request<{ id: string; status: string }>(`/api/inquiries/${inquiryId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true),

  replyInquiry: (inquiryId: string, payload: { recipientEmail: string; subject: string; message: string }) =>
    request<{ id: string }>(`/api/inquiries/${inquiryId}/reply`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true),

  updatePropertyStatus: (propertyId: string, status: 'active' | 'sold' | 'rented') =>
    request<{ status: string }>(`/api/property-owner/properties/${propertyId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }, true),

  getPropertyInquiries: (propertyId: string) =>
    request<Inquiry[]>(`/api/property-owner/properties/${propertyId}/inquiries`, {}, true),

  getPropertyStats: (propertyId: string) =>
    request<{ viewsCount: number; inquiriesCount: number }>(
      `/api/property-owner/properties/${propertyId}/stats`,
      {},
      true
    ),
};