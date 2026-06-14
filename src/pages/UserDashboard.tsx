import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Send, Clock, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common';
import { api } from '../services/api';
import { chatService } from '../services/chatService';
import { Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { ChatWindow } from '../components/messaging/ChatWindow';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState('');

  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState('');

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    if (user.role !== 'user') {
      navigate(user.role === 'realtor' ? '/dashboard' : '/user-dashboard', { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (loading || !user) return;
    if (user.role !== 'user') return;

    const loadEssentials = async () => {
      try {
        setIsLoadingData(true);
        setError('');
        const userInquiriesRes = await api.getUserInquiries();
        setInquiries(userInquiriesRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load user inquiries dashboard data');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadEssentials();
  }, [loading, user]);

  const stats = useMemo(() => {
    const counts = { total: 0, pending: 0, replied: 0, closed: 0 };
    if (!inquiries) return counts;
    counts.total = inquiries.length;
    inquiries.forEach((inq) => {
      if (inq.status === 'replied') counts.replied += 1;
      else if (inq.status === 'closed') counts.closed += 1;
      else counts.pending += 1;
    });
    return counts;
  }, [inquiries]);

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-cream-100/30 pt-24 flex items-center justify-center">
        <p className="text-walnut-600">Loading Dashboard...</p>
      </div>
    );
  }

  if (!user || user.role !== 'user') {
    return null;
  }

  const getStatusStyle = (status: Inquiry['status']) => {
    switch (status) {
      case 'replied':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'contacted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const startChatConversation = async (inq: Inquiry) => {
    const channelId = await chatService.createOrGetChannel({
      id: inq.id,
      inquiryId: inq.id,
      propertyId: inq.propertyId,
      propertyTitle: inq.propertyTitle,
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      realtorId: inq.realtorId || '',
      realtorName: inq.realtorName || 'Assigned Realtor',
      lastMessageText: 'Chat room initialized',
      lastMessageTimestamp: new Date().toISOString()
    });
    
    setChatTitle(`${inq.propertyTitle} (${inq.realtorName || 'Agent'})`);
    setActiveChatChannel(channelId);
  };

  return (
    <div className="min-h-screen bg-cream-100/30 pt-20 lg:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <section className="bg-cream-50 rounded-2xl shadow-sm border border-walnut-100 p-6 lg:p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-serif font-bold text-walnut-800">Welcome, {user.name}</h1>
              <p className="text-walnut-600 mt-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-teak-600" />
                {user.email}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigate('/properties')}>
                Browse Properties
              </Button>
            </div>
          </div>
        </section>

        {/* Statistics Bar */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-walnut-100 p-5 flex flex-col justify-between">
            <span className="text-sm font-medium text-walnut-500 uppercase tracking-wider">Total Inquiries</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-walnut-800">{stats.total}</span>
              <Send className="w-5 h-5 text-walnut-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-walnut-100 p-5 flex flex-col justify-between">
            <span className="text-sm font-medium text-walnut-500 uppercase tracking-wider">Pending Response</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-amber-600">{stats.pending}</span>
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-walnut-100 p-5 flex flex-col justify-between">
            <span className="text-sm font-medium text-walnut-500 uppercase tracking-wider">Replied by Realtor</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-green-600">{stats.replied}</span>
              <MessageSquare className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-walnut-100 p-5 flex flex-col justify-between">
            <span className="text-sm font-medium text-walnut-500 uppercase tracking-wider">Closed Cases</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-3xl font-bold text-gray-600">{stats.closed}</span>
              <CheckCircle2 className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Central Dashboard Inquiries Feed */}
        <section className="bg-cream-50 rounded-2xl shadow-sm border border-walnut-100 overflow-hidden p-6">
          <h2 className="text-xl font-bold text-walnut-800 mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-teak-600" />
            My Applications & History
          </h2>

          {inquiries.length === 0 ? (
            <div className="p-12 text-center bg-white/50 border border-dashed border-walnut-200 rounded-xl">
              <p className="text-walnut-500 text-sm">You haven’t submitted any property inquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inq) => (
                <div key={inq.id} className="bg-white rounded-xl border border-walnut-100 p-5 shadow-sm transition-all hover:shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-walnut-50 pb-3 mb-4">
                    <div>
                      <h3 className="font-semibold text-walnut-800 text-base">{inq.propertyTitle}</h3>
                      <p className="text-xs text-walnut-400 mt-1">
                        Submitted on: {inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : '-'}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button onClick={() => startChatConversation(inq)}>
                        <MessageSquare className="w-3.5 h-3.5 mr-1" /> Open Live Chat
                      </Button>
                      <span className={`text-xs px-2.5 py-1 font-semibold rounded-full border ${getStatusStyle(inq.status)}`}>
                        {inq.status.toUpperCase()}
                      </span>
                    </div>
                  </div>


                </div>
              ))}
            </div>
          )}
        </section>

      </div>

      {activeChatChannel && (
        <ChatWindow
          channelId={activeChatChannel}
          currentUserId={user.id}
          currentUserName={user.name}
          currentUserRole="user"
          title={chatTitle}
          onClose={() => setActiveChatChannel(null)}
        />
      )}
    </div>
  );
};

export default UserDashboard;