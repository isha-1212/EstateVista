import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import { Navbar, Footer } from './components/common';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import RealtorDashboard from './pages/RealtorDashboard';
import UserDashboard from './pages/UserDashboard';
import AddProperty from './pages/AddProperty';
import AccessDenied from './pages/AccessDenied';
import ProtectedRealtorRoute from './components/auth/ProtectedRealtorRoute';
import ProtectedUserRoute from './components/auth/ProtectedUserRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';
import { AuthProvider } from './context/AuthContext';
import LayoutWithNavbarSpacing from './components/common/LayoutWithNavbarSpacing';

function AppContent() {
  const location = useLocation();

  const hideFooterRoutes = [
    '/dashboard',
    '/user-dashboard',
    '/add-property',
    '/edit-property',
  ];

  const showFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-cream-50">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<PropertyListing />} />
          <Route path="/property/:id" element={<PropertyDetails />} />

          {/* Realtor pages */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRealtorRoute>
                <RealtorDashboard />
              </ProtectedRealtorRoute>
            }
          />

          <Route
            path="/add-property"
            element={
              <ProtectedRealtorRoute>
                <AddProperty />
              </ProtectedRealtorRoute>
            }
          />

          {/* User pages */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedUserRoute>
                <UserDashboard />
              </ProtectedUserRoute>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/access-denied" element={<AccessDenied />} />

          {/* Legacy route */}
          <Route path="/edit-property" element={<AccessDenied />} />
        </Routes>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <LayoutWithNavbarSpacing>
          <AppContent />
        </LayoutWithNavbarSpacing>
      </Router>
    </AuthProvider>
  );
}

export default App;

