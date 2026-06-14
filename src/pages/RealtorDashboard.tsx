import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Mail, LogOut,
  Plus, Edit2, Trash2, Eye, MoreVertical
} from 'lucide-react';
import { Button } from '../components/common';
import { Inquiry, Property } from '../types';
import { api } from '../services/api';
import { chatService } from '../services/chatService';
import { useAuth } from '../context/AuthContext';
import { fallbackPropertyImage } from '../constants/propertyOptions';
import { ChatWindow } from '../components/messaging/ChatWindow';

const RealtorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  const myProperties = properties.filter(p => p.realtor?.id === user?.id);
  const myInquiries = inquiries;

  const [activeTab, setActiveTab] = useState<'properties' | 'inquiries'>('properties');
  const [inquiryFilter, setInquiryFilter] = useState<'all' | 'new' | 'contacted' | 'replied' | 'closed'>('all');
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [replyOpen, setReplyOpen] = useState(false);
  const [replyInquiryItem, setReplyInquiryItem] = useState<Inquiry | null>(null);
  const [replyForm, setReplyForm] = useState({ subject: '', message: '', recipientEmail: '' });

  const [activeInquiryId, setActiveInquiryId] = useState<string | null>(null);
  const [menuInquiryId, setMenuInquiryId] = useState<string | null>(null);

  const openConversation = async (inq: Inquiry) => {
    // Ensure the reply modal is not opened when user clicks "View Conversation"
    setReplyOpen(false);
    setReplyInquiryItem(null);

    setActiveInquiryId(inq.id);
    setMenuInquiryId(null);

    const channelId = await chatService.createOrGetChannel({
      id: inq.id,
      inquiryId: inq.id,
      propertyId: inq.propertyId,
      propertyTitle: inq.propertyTitle,
      buyerId: (inq as any).buyerId || '',
      buyerName: (inq as any).name || (inq as any).buyerName || '',
      buyerEmail: inq.email,
      realtorId: user?.id || '',
      realtorName: user?.name || 'Realtor',
      lastMessageText: 'Chat room initialized',
      lastMessageTimestamp: new Date().toISOString()
    });

    setChatTitle(`${inq.propertyTitle} (${(inq as any).name || (inq as any).buyerName || 'Client'})`);
    setActiveChatChannel(channelId);
  };





  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null);

  const [chatTitle, setChatTitle] = useState('');

  const myActiveInquiries = useMemo(() => {
    if (!inquiries) return [];
    if (inquiryFilter === 'all') return myInquiries;
    return myInquiries.filter((i) => i.status === inquiryFilter);
  }, [inquiries, inquiryFilter, myInquiries]);

  const refreshInquiries = async () => {
    try {
      setLoadingInquiries(true);
      const inquiriesResponse = await api.getInquiries();
      setInquiries(inquiriesResponse.data || []);
    } catch (err) {
      setToast({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to refresh inquiries',
      });
    } finally {
      setLoadingInquiries(false);
    }
  };

  useEffect(() => {
    const t = toast ? setTimeout(() => setToast(null), 3500) : null;
    return () => {
      if (t) clearTimeout(t);
    };
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'realtor') {
      navigate('/access-denied', { replace: true });
      return;
    }

    const loadDashboard = async () => {
      try {
        setIsLoadingData(true);
        // Note: api.getProperties now returns an object payload { properties, totalCount, ... }
        const [propertiesResponse, inquiriesResponse] = await Promise.all([
          api.getProperties({ limit: 1000 }), 
          api.getInquiries(),
        ]);
        
        const receivedProps = propertiesResponse.data && 'properties' in propertiesResponse.data 
          ? (propertiesResponse.data as any).properties 
          : (propertiesResponse.data || []);
          
        setProperties(receivedProps || []);
        setInquiries(inquiriesResponse.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadDashboard();
  }, [loading, navigate, user]);

  const sidebarItems = [
    { id: 'properties', label: 'My Properties', icon: Building2, badge: myProperties.length },
    { id: 'inquiries', label: 'Inquiries', icon: Mail, badge: myInquiries.length },
  ];

  const getStatusColor = (status: Inquiry['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-700';
      case 'contacted':
        return 'bg-amber-100 text-amber-700';
      case 'replied':
        return 'bg-green-100 text-green-700';
      case 'closed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-walnut-100 text-walnut-700';
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    if (confirm('Are you sure you want to delete this property?')) {
      api.deleteProperty(propertyId)
        .then(() => {
          setProperties(prev => prev.filter(property => property.id !== propertyId));
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Failed to delete property');
        });
    }
  };



  if (loading || isLoadingData || !user) {
    return (
      <div className="min-h-screen bg-cream-100/30 pt-24 flex items-center justify-center">
        <p className="text-walnut-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100/30 pt-16 lg:pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-cream-50 rounded-2xl shadow-sm border border-walnut-100 p-6 sticky top-28">
              {/* User Profile */}
              <div className="text-center mb-6 pb-6 border-b border-walnut-100">
                <img
                  src={user.avatar || fallbackPropertyImage}
                  alt={user.name}
                  className="w-20 h-20 rounded-2xl object-cover mx-auto mb-3"
                />
                <h3 className="font-semibold text-walnut-800">{user.name}</h3>
                <p className="text-sm text-walnut-500">{user.email}</p>
                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-teak-100 text-teak-700 text-xs font-medium">
                  ✓ Verified Realtor
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as typeof activeTab)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-teak-600 text-cream-50'
                          : 'text-walnut-600 hover:bg-walnut-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activeTab === item.id
                            ? 'bg-cream-50/20 text-cream-50'
                            : 'bg-walnut-100 text-walnut-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className="pt-6 mt-6 border-t border-walnut-100 space-y-2">
                <button
                  onClick={() => navigate('/add-property')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-walnut-600 hover:bg-walnut-50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add Property
                </button>

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-2xl lg:text-3xl font-serif font-bold text-walnut-800">
                  {activeTab === 'properties' && 'My Properties'}
                  {activeTab === 'inquiries' && 'Inquiries'}
                </h1>
                <p className="text-walnut-500 mt-1">
                  Manage your listings and track inquiries
                </p>
              </div>
              {activeTab === 'properties' && (
                <Button
                  onClick={() => navigate('/add-property')}
                >
                  Add Property
                </Button>
              )}
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm">
                {error}
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="bg-cream-50 rounded-2xl shadow-sm border border-walnut-100 overflow-hidden">
                <div className="p-4 border-b border-walnut-100">
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-walnut-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-walnut-600 uppercase tracking-wide">Property</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-walnut-600 uppercase tracking-wide">Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-walnut-600 uppercase tracking-wide">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-walnut-600 uppercase tracking-wide">Price</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-walnut-600 uppercase tracking-wide">Views</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-walnut-600 uppercase tracking-wide">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-walnut-100">
                      {myProperties.map((property) => (
                        <tr key={property.id} className="hover:bg-walnut-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={property.images?.[0] || fallbackPropertyImage}
                                alt={property.title}
                                className="w-16 h-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-walnut-800">{property.title}</p>
                                <p className="text-sm text-walnut-500">{property.location}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-walnut-100 text-walnut-700">
                              {property.propertyType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              property.listingType === 'sale'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              For {property.listingType}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-walnut-800">
                            ₹{(property.price / 100000).toFixed(0)} Lac
                          </td>
                          <td className="px-6 py-4 text-walnut-600">245</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                to={`/property/${property.id}`}
                                className="p-2 rounded-lg hover:bg-walnut-100 text-walnut-600 hover:text-teak-600 transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </Link>
                              <button
                                onClick={() => navigate(`/add-property?id=${property.id}`)}
                                className="p-2 rounded-lg hover:bg-walnut-100 text-walnut-600 hover:text-teak-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProperty(property.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-walnut-600 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
              <div className="bg-cream-50 rounded-2xl shadow-sm border border-walnut-100 overflow-hidden">
                <div className="p-4 border-b border-walnut-100">
                  <div className="flex flex-wrap items-center gap-3">
                    {(
                      [
                        { key: 'all' as const, label: 'All', count: myInquiries.length },
                        { key: 'new' as const, label: 'New', count: myInquiries.filter(i => i.status === 'new').length },
                        { key: 'contacted' as const, label: 'Contacted', count: myInquiries.filter(i => i.status === 'contacted').length },
                        { key: 'replied' as const, label: 'Replied', count: myInquiries.filter(i => i.status === 'replied').length },
                        { key: 'closed' as const, label: 'Closed', count: myInquiries.filter(i => i.status === 'closed').length },
                      ]
                    ).map((t) => (
                      <button
                        key={t.key}
                        onClick={() => setInquiryFilter(t.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          inquiryFilter === t.key
                            ? 'bg-teak-600 text-cream-50'
                            : 'bg-walnut-100 text-walnut-600 hover:bg-walnut-200'
                        }`}
                      >
                        {t.label} ({t.count})
                      </button>
                    ))}
                  </div>
                </div>

                {toast && (
                  <div className={`px-4 pt-3 ${toast.type === 'success' ? 'text-teak-700' : 'text-red-600'}`}>
                    <div className={`rounded-xl border p-3 text-sm ${toast.type === 'success' ? 'bg-teak-50 border-teak-200' : 'bg-red-50 border-red-200'}`}>
                      {toast.message}
                    </div>
                  </div>
                )}

                {loadingInquiries ? (
                  <div className="p-6 text-walnut-600">Loading inquiries...</div>
                ) : (
                  <div className="divide-y divide-walnut-100">
                    {myActiveInquiries.map((inquiry) => {
                      const isMenuOpen = menuInquiryId === inquiry.id;
                      return (
                        <div key={inquiry.id} className="p-5 sm:p-6 hover:bg-walnut-50/50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <button
                              type="button"
                              className="flex items-start gap-4 text-left"
                              onClick={() => setActiveInquiryId(inquiry.id)}
                            >
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teak-400 to-walnut-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-cream-50 font-bold">{inquiry.name?.charAt(0) || '?'}</span>
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-semibold text-walnut-800">{inquiry.name}</h4>
                                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(inquiry.status)}`}>
                                    {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                                  </span>
                                </div>

                                <div className="text-sm text-walnut-600">
                                  {inquiry.propertyTitle}
                                </div>

                                <div className="mt-1 text-sm text-walnut-500">
                                  {inquiry.createdAt}
                                </div>
                              </div>
                            </button>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openConversation(inquiry)}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-teak-600 text-cream-50 text-sm font-medium hover:bg-teak-700 transition-colors"
                              >
                                View Conversation
                              </button>

                              <div className="relative">
                                <button
                                  type="button"
                                  aria-label="More actions"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuInquiryId((prev) => (prev === inquiry.id ? null : inquiry.id));
                                  }}
                                  className="p-2 rounded-xl hover:bg-walnut-100 text-walnut-700 transition-colors"
                                >
                                  <MoreVertical className="w-5 h-5" />
                                </button>

                                {isMenuOpen && (
                                  <div
                                    className="absolute right-0 mt-2 w-56 bg-cream-50 border border-walnut-100 rounded-2xl shadow-lg overflow-hidden z-10"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      className="w-full text-left px-4 py-3 text-sm text-walnut-700 hover:bg-walnut-100 flex items-center justify-between"
                                      onClick={async () => {
                                        try {
                                          await api.updateInquiryStatus(inquiry.id, 'contacted');
                                          setToast({ type: 'success', message: 'Inquiry marked as contacted' });
                                          await refreshInquiries();
                                          setMenuInquiryId(null);
                                        } catch (err) {
                                          setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to mark contacted' });
                                        }
                                      }}
                                    >
                                      <span>Mark as Contacted</span>
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-3 text-sm text-walnut-700 hover:bg-walnut-100 flex items-center justify-between"
                                      onClick={async () => {
                                        const ok = confirm('Are you sure you want to close this inquiry?');
                                        if (!ok) return;
                                        try {
                                          await api.updateInquiryStatus(inquiry.id, 'closed');
                                          setToast({ type: 'success', message: 'Inquiry closed' });
                                          await refreshInquiries();
                                          setMenuInquiryId(null);
                                        } catch (err) {
                                          setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to close inquiry' });
                                        }
                                      }}
                                    >
                                      <span>Close Inquiry</span>
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-3 text-sm text-walnut-700 hover:bg-walnut-100 flex items-center justify-between"
                                      onClick={() => {
                                        setMenuInquiryId(null);
                                        setReplyInquiryItem(inquiry);
                                        const existingSubject = typeof inquiry.replySubject === 'object'
                                          ? (inquiry.replySubject as any)?.subject
                                          : inquiry.replySubject;
                                        setReplyForm({
                                          recipientEmail: inquiry.email,
                                          subject: existingSubject || `Re: ${inquiry.propertyTitle}`,
                                          message: '',
                                        });
                                        setReplyOpen(true);
                                      }}
                                    >
                                     
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-walnut-600 bg-walnut-50 rounded-xl p-4 line-clamp-2">
                              {inquiry.message}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {myActiveInquiries.length === 0 && (
                      <div className="p-8 text-walnut-600">No inquiries in this category.</div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Reply Modal */}
            {replyOpen && replyInquiryItem && (
              <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-cream-50 rounded-2xl shadow-xl border border-walnut-100 overflow-hidden">
                  <div className="p-5 border-b border-walnut-100 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-walnut-800">Reply to Inquiry</h3>
                      <p className="text-sm text-walnut-600 mt-1">{replyInquiryItem.name} • {replyInquiryItem.propertyTitle}</p>
                    </div>
                    <button
                      className="p-2 rounded-lg hover:bg-walnut-100 text-walnut-700"
                      onClick={() => setReplyOpen(false)}
                      aria-label="Close"
                    >
                      ✕
                    </button>
                  </div>

                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      
                      try {
                        await api.replyInquiry(replyInquiryItem.id, {
                          recipientEmail: replyForm.recipientEmail,
                          subject: replyForm.subject,
                          message: replyForm.message,
                        });
                        setToast({ type: 'success', message: 'Reply sent successfully' });
                        setReplyOpen(false);
                        setReplyInquiryItem(null);
                        setReplyForm({ subject: '', message: '', recipientEmail: '' });
                        await refreshInquiries();
                      } catch (err) {
                        setToast({ type: 'error', message: err instanceof Error ? err.message : 'Failed to send reply' });
                      } 
                    }}
                    className="p-5 space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-medium text-walnut-700 mb-1">Recipient Email</label>
                      <input
                        type="email"
                        value={replyForm.recipientEmail}
                        disabled
                        className="w-full px-4 py-3 bg-walnut-100 border border-walnut-200 rounded-xl text-walnut-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-walnut-700 mb-1">Subject</label>
                      <input
                        type="text"
                        value={replyForm.subject}
                        onChange={(e) => setReplyForm((p) => ({ ...p, subject: e.target.value }))}
                        required
                        className="w-full px-4 py-3 bg-white border border-walnut-200 rounded-xl text-walnut-800 focus:outline-none focus:ring-2 focus:ring-teak-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-walnut-700 mb-1">Message</label>
                      <textarea
                        rows={5}
                        value={replyForm.message}
                        onChange={(e) => setReplyForm((p) => ({ ...p, message: e.target.value }))}
                        required
                        className="w-full px-4 py-3 bg-white border border-walnut-200 rounded-xl text-walnut-800 focus:outline-none focus:ring-2 focus:ring-teak-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                      <Button onClick={() => setReplyOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget.closest('form');
                        if (form) form.requestSubmit();
                      }}>
                        Send Reply
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {activeChatChannel && (
        <ChatWindow
          channelId={activeChatChannel}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="realtor"
          title={chatTitle}
          onClose={() => setActiveChatChannel(null)}
        />
      )}
    </div>
  );
};

export default RealtorDashboard;