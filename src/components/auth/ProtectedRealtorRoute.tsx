import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRealtorRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-cream-100/30">
        <p className="text-walnut-600">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'realtor') {
    // user attempting realtor routes -> go to Home (no user dashboard page)
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

