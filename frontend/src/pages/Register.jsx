import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, KeyRound, Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import AuthHeroGraphic from '../components/auth/AuthHeroGraphic';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminInviteCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 10) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'bg-amber-500', width: 'w-2/3' };
    return { score: 3, label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const validate = (data) => {
    const errs = {};
    if (!data.fullName?.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (data.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (!data.email?.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!data.password) {
      errs.password = 'Password is required.';
    } else if (data.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!data.confirmPassword) {
      errs.confirmPassword = 'Confirm your password.';
    } else if (data.password !== data.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errs = validate(formData);
    setErrors((prev) => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(validationErrors).length > 0) return;

    setIsLoading(true);
    setServerError(null);

    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        adminInviteCode: formData.adminInviteCode.trim(),
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please check your submission.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans antialiased text-midnight-900">
      {/* LEFT SECTION: FORM */}
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

          <Link
            to="/login"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="my-auto py-6 max-w-md w-full mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight mb-2">
              Create Admin Account
            </h1>
            <p className="text-sm text-slate-500">
              Initialize system administration or register with an authorization invite code.
            </p>
          </div>

          {serverError && (
            <Alert
              type="error"
              message={serverError}
              onClose={() => setServerError(null)}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName && touched.fullName
                      ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                      : 'border-slate-200/90 focus:ring-brand-500/20 focus:border-brand-500'
                  }`}
                />
              </div>
              {errors.fullName && touched.fullName && (
                <p className="mt-1 text-xs text-rose-600 font-medium">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Email */}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="Enter your email address"
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
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

            {/* Password & Confirm Password (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.password && touched.password
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200/90 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle password"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur('confirmPassword')}
                    placeholder="Confirm password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200/90 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="Toggle confirm password"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Password Strength */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Strength</span>
                  <span className={passwordStrength.score >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                </div>
              </div>
            )}

            {/* Admin Invite Code */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Admin Invite Code
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Optional for initial Superadmin</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="adminInviteCode"
                  value={formData.adminInviteCode}
                  onChange={handleChange}
                  placeholder="Enter admin invitation code"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Initial registration establishes the master Superadmin. Additional accounts require an authorized key.
              </p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                className="w-full font-bold shadow-brand"
              >
                Create Administrator Account
              </Button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
            <span>Already have an account?</span>{' '}
            <Link
              to="/login"
              className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 transition-colors ml-1"
            >
              <span>Sign in here</span>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Encrypted Administration</span>
          </div>
          <span>&copy; {new Date().getFullYear()} EduManage Inc.</span>
        </div>
      </div>

      {/* RIGHT SECTION: VISUAL HERO */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[55%] relative">
        <AuthHeroGraphic
          headline="Unified University Administration."
          subtext="Deploy scalable student management with bank-grade authentication, role-based controls, and institutional security."
        />
      </div>
    </div>
  );
};

export default Register;
