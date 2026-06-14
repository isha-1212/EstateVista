import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AccessDenied = () => {

  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    // Logged-in users should not stay on AccessDenied.
    navigate(user.role === 'realtor' ? '/dashboard' : '/user-dashboard', { replace: true });
  }, [loading, navigate, user]);

  if (loading || user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50 px-4 pt-24">
      <div className="max-w-lg w-full bg-cream-50 border border-walnut-100 rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-serif font-bold text-walnut-800 mb-3">Access Denied</h1>
        <p className="text-walnut-600">You do not have permission to view this page.</p>
      </div>
    </div>
  );
};

export default AccessDenied;


