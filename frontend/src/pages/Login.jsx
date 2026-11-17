import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import AuthHeroGraphic from '../components/auth/AuthHeroGraphic';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  // If already authenticated, redirect to destination
  useEffect(() => {
    if (isAuthenticated) {
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    }
    return errs;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate();
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await login(email.trim(), password, rememberMe);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased text-midnight-900">
      {/* LEFT SECTION: AUTHENTICATION FORM */}
      <div className="w-full lg:w-[48%] xl:w-[45%] flex flex-col justify-between p-6 sm:p-12 xl:p-16 relative z-10 min-h-screen">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-cyan-500 text-white flex items-center justify-center shadow-brand shadow-md group-hover:scale-105 transition-all duration-300">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-midnight-950 block leading-tight">
                Edu<span className="text-brand-500">Manage</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                University SaaS
              </span>
            </div>
          </Link>

          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
            v2.4 Pro
          </span>
        </div>

        {/* Center Form Container */}
        <div className="my-auto py-8 max-w-md w-full mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight mb-2">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">
              Please enter your administrator credentials to access your dashboard.
            </p>
          </div>

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              onClose={() => setServerError(null)}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="Enter your email address"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.email && touched.email
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-11 py-3 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.password && touched.password
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-midnight-900">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-400 border-slate-300"
                />
                <span className="font-medium">Remember this device for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full text-base font-bold shadow-brand mt-2"
            >
              Sign In to Admin Portal
            </Button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 text-center text-xs text-slate-500 border-t border-slate-100 pt-6">
            <span>First-time setup or need administrator access?</span>{' '}
            <Link
              to="/register"
              className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors ml-1"
            >
              <span>Register new admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <span>&copy; {new Date().getFullYear()} EduManage Inc.</span>
        </div>
      </div>

      {/* RIGHT SECTION: MODERN SPLIT-SCREEN VISUAL */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative">
        <AuthHeroGraphic
          headline="Intelligent Administration for Higher Education."
          subtext="Streamline student registrations, academic courses, and departmental analytics with our enterprise university management suite."
        />
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-midnight-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-soft-lg border border-slate-100">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-midnight-900 mb-2">Password Reset Assistance</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              For security compliance, administrator password resets require authorization from your primary Superadmin via the security console.
            </p>
            <Button
              variant="primary"
              onClick={() => setForgotModalOpen(false)}
              className="w-full"
            >
              Acknowledged
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
