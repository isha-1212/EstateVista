import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, Eye, EyeOff, Phone, Check } from 'lucide-react';
import { Button } from '../components/common';
import { api } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<'user' | 'realtor' | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.agreeTerms) newErrors.agreeTerms = 'Please accept the terms';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 1 && selectedRole) {
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2 && validateStep2()) {
      setIsLoading(true);
      try {
        await api.signup({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: selectedRole || 'user',
        });
        navigate('/login');
      } catch (err) {
        setErrors({
          submit: err instanceof Error ? err.message : 'Signup failed',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
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
              Estate<span className="text-teak-400">Vista</span>
            </span>
          </Link>
          <p className="text-walnut-300 mt-4 text-sm">
            Create your account to get started.
          </p>
        </div>

        {/* Signup Card */}
        <div className="bg-cream-50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-walnut-100">
            <div
              className="h-full bg-gradient-to-r from-teak-500 to-walnut-600 transition-all duration-500"
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-serif font-bold text-walnut-800 text-center mb-2">
              Create Account
            </h2>
            <p className="text-center text-walnut-500 text-sm mb-6">
              {currentStep === 1 ? 'Step 1: Select your role' : 'Step 2: Complete your profile'}
            </p>

            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}

              {/* Step 1: Role Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      className={`relative flex flex-col items-center p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                        selectedRole === 'user'
                          ? 'bg-teak-50 border-teak-400 shadow-md'
                          : 'bg-walnut-50 border-walnut-200 hover:border-walnut-300'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                        selectedRole === 'user'
                          ? 'bg-teak-600'
                          : 'bg-walnut-200'
                      }`}>
                        <User className={`w-10 h-10 ${selectedRole === 'user' ? 'text-cream-50' : 'text-walnut-500'}`} />
                      </div>
                      <h3 className={`font-semibold text-lg ${selectedRole === 'user' ? 'text-teak-700' : 'text-walnut-700'}`}>
                        Buyer / Renter
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 text-center">
                        Search & save properties
                      </p>
                      {selectedRole === 'user' && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teak-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-cream-50" />
                        </div>
                      )}
                      <input
                        type="radio"
                        name="role"
                        checked={selectedRole === 'user'}
                        onChange={() => setSelectedRole('user')}
                        className="sr-only"
                      />
                    </label>

                    <label
                      className={`relative flex flex-col items-center p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                        selectedRole === 'realtor'
                          ? 'bg-teak-50 border-teak-400 shadow-md'
                          : 'bg-walnut-50 border-walnut-200 hover:border-walnut-300'
                      }`}
                    >
                      <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${
                        selectedRole === 'realtor'
                          ? 'bg-teak-600'
                          : 'bg-walnut-200'
                      }`}>
                        <Building2 className={`w-10 h-10 ${selectedRole === 'realtor' ? 'text-cream-50' : 'text-walnut-500'}`} />
                      </div>
                      <h3 className={`font-semibold text-lg ${selectedRole === 'realtor' ? 'text-teak-700' : 'text-walnut-700'}`}>
                        Realtor / Agent
                      </h3>
                      <p className="text-gray-500 text-sm mt-1 text-center">
                        List & sell properties
                      </p>
                      {selectedRole === 'realtor' && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-teak-600 flex items-center justify-center">
                          <Check className="w-4 h-4 text-cream-50" />
                        </div>
                      )}
                      <input
                        type="radio"
                        name="role"
                        checked={selectedRole === 'realtor'}
                        onChange={() => setSelectedRole('realtor')}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!selectedRole}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Step 2: Details Form */}
              {currentStep === 2 && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-walnut-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Your full name"
                        className={`w-full pl-12 pr-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${errors.name ? 'border-red-300' : 'border-walnut-200'}`}
                      />
                    </div>
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-walnut-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className={`w-full pl-12 pr-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${errors.email ? 'border-red-300' : 'border-walnut-200'}`}
                      />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-walnut-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="+91 98471 00000"
                        className={`w-full pl-12 pr-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${errors.phone ? 'border-red-300' : 'border-walnut-200'}`}
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-walnut-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="Create a password"
                        className={`w-full pl-12 pr-12 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${errors.password ? 'border-red-300' : 'border-walnut-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-walnut-400 hover:text-walnut-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-walnut-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-walnut-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        className={`w-full pl-12 pr-4 py-3 bg-walnut-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teak-500 text-walnut-800 placeholder-walnut-400 ${errors.confirmPassword ? 'border-red-300' : 'border-walnut-200'}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  </div>

                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.agreeTerms}
                        onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                        className="mt-0.5 accent-teak-600 w-4 h-4 rounded"
                      />
                      <span className="text-sm text-walnut-600">
                        I agree to the{' '}
                        <a href="#" className="text-teak-600 hover:text-teak-700 font-medium">Terms of Service</a>
                        {' '}and{' '}
                        <a href="#" className="text-teak-600 hover:text-teak-700 font-medium">Privacy Policy</a>
                      </span>
                    </label>
                    {errors.agreeTerms && <p className="text-red-500 text-xs mt-1">{errors.agreeTerms}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      size="lg"
                      isLoading={isLoading}
                      disabled={!formData.agreeTerms}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-walnut-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-teak-600 hover:text-teak-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
