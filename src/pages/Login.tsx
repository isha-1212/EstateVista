import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth as firebaseAuth } from '../firebaseClient';

import { Button } from '../components/common';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!firebaseAuth) {
        setError(
          'Firebase is not configured. Please set VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID and VITE_FIREBASE_APP_ID in a .env.local file and restart the dev server.'
        );
        return;
      }

      // 1) Sign in with Firebase Authentication (client SDK)
      const userCredential = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );


      // 2) Get Firebase ID token
      const token = await userCredential.user.getIdToken();

      // 3) Send token to backend so Admin SDK verifies it
      const data = await api.login(token);

      // 4) Redirect on success
      localStorage.setItem('token', data.token || token);

      // Redirect based on role from backend response/user
      navigate((data as any)?.role === 'realtor' ? '/dashboard' : '/user-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-walnut-900 via-walnut-800 to-teak-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-teak-500 to-walnut-600 rounded-xl flex items-center justify-center shadow-lg">
              <Building2 className="w-7 h-7 text-cream-50" />
            </div>
            <span className="text-2xl font-serif font-semibold text-cream-50">
              Estate<span className="text-teak-400">vista</span>
            </span>
          </Link>
          <p className="text-walnut-300 mt-4 text-sm">
            Welcome back! Sign in to your account.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-cream-50 rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-serif font-bold text-walnut-800 text-center mb-6">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2 animate-shake">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-walnut-50 border border-walnut-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-walnut-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-3 bg-walnut-50 border border-walnut-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-walnut-400 hover:text-walnut-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-teak-600 w-4 h-4 rounded" />
                <span className="text-sm text-walnut-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-teak-600 hover:text-teak-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>

              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-walnut-600 text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-teak-600 hover:text-teak-700 font-medium">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
