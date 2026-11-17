import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  ShieldCheck,
  Calendar,
  Clock,
  Camera,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  LogOut,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../api/authService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const Profile = () => {
  const { user, updateUser, refreshProfile, logout } = useAuth();
  const fileInputRef = useRef(null);

  // Active sub-tab
  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'photo' | 'password' | 'security'

  // Alerts
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Personal Info Form State
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    fullName: '',
    phone: '',
    department: '',
    designation: '',
  });
  const [infoLoading, setInfoLoading] = useState(false);
  const [infoErrors, setInfoErrors] = useState({});

  // Profile Photo State
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState(null);

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Populate personal info from actual authenticated user
  useEffect(() => {
    if (user) {
      setInfoForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || '',
      });
      setPhotoPreview(user.avatar || null);
    }
  }, [user]);

  // Helper to show auto-dismissing toast
  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(msg);
      setErrorMessage(null);
    }
    setTimeout(() => {
      setSuccessMessage((curr) => (curr === msg ? null : curr));
      setErrorMessage((curr) => (curr === msg ? null : curr));
    }, 5000);
  };

  // ----------------------------------------------------
  // PERSONAL INFO HANDLERS
  // ----------------------------------------------------
  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setInfoForm((prev) => ({ ...prev, [name]: value }));
    if (infoErrors[name]) {
      setInfoErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!infoForm.fullName?.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (infoForm.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    }

    if (Object.keys(errs).length > 0) {
      setInfoErrors(errs);
      return;
    }

    setInfoLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.updateProfile({
        fullName: infoForm.fullName.trim(),
        phone: infoForm.phone.trim(),
        department: infoForm.department.trim(),
        designation: infoForm.designation.trim(),
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setIsEditingInfo(false);
        showToast(res.message || 'Personal information updated successfully.');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update personal information.', true);
    } finally {
      setInfoLoading(false);
    }
  };

  const handleInfoCancel = () => {
    if (user) {
      setInfoForm({
        fullName: user.fullName || '',
        phone: user.phone || '',
        department: user.department || '',
        designation: user.designation || '',
      });
    }
    setInfoErrors({});
    setIsEditingInfo(false);
  };

  // ----------------------------------------------------
  // PROFILE PHOTO HANDLERS
  // ----------------------------------------------------
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    // Validate type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setPhotoError('Invalid image format. Supported formats: PNG, JPG, JPEG, WEBP.');
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Image file size exceeds the 2MB limit. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSavePhoto = async () => {
    setPhotoLoading(true);
    setPhotoError(null);
    try {
      const res = await authService.updateProfile({
        avatar: photoPreview || '',
      });
      if (res.success && res.data) {
        updateUser(res.data);
        showToast('Profile photo updated successfully.');
      }
    } catch (err) {
      setPhotoError(err.message || 'Failed to upload profile photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoLoading(true);
    setPhotoError(null);
    try {
      const res = await authService.updateProfile({
        avatar: '',
      });
      if (res.success && res.data) {
        updateUser(res.data);
        setPhotoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showToast('Profile photo removed.');
      }
    } catch (err) {
      setPhotoError(err.message || 'Failed to remove profile photo.');
    } finally {
      setPhotoLoading(false);
    }
  };

  // ----------------------------------------------------
  // CHANGE PASSWORD HANDLERS
  // ----------------------------------------------------
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

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const errs = {};

    if (!passwordForm.currentPassword) {
      errs.currentPassword = 'Enter your current password.';
    }

    if (!passwordForm.newPassword) {
      errs.newPassword = 'Enter a new password.';
    } else if (passwordForm.newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }

    if (!passwordForm.confirmNewPassword) {
      errs.confirmNewPassword = 'Confirm your new password.';
    } else if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      errs.confirmNewPassword = 'New passwords do not match.';
    }

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }

    setPasswordLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmNewPassword: passwordForm.confirmNewPassword,
      });

      if (res.success) {
        showToast(res.message || 'Password changed successfully.');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setPasswordErrors({});
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password.', true);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Helper avatar fallback initials
  const getInitials = (name) => {
    if (!name) return 'AD';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return (
      <div className="py-20 text-center">
        <LoadingSpinner text="Loading administrator profile..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrator Profile
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your personal details, credentials, and account security.
          </p>
        </div>
      </div>

      {/* Global Toast Messages */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      {errorMessage && (
        <Alert
          type="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}

      {/* SECTION 1: PROFILE OVERVIEW CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative group shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || 'Admin'}
                  className="w-24 h-24 rounded-2xl object-cover ring-4 ring-brand-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-brand-500/25">
                  {getInitials(user.fullName)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {user.fullName || 'Administrator'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-700 border border-brand-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {user.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {user.status || 'Active'}
                </span>
              </div>

              <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
              </p>

              {(user.department || user.designation) && (
                <p className="text-xs text-slate-600 font-medium">
                  {[user.designation, user.department].filter(Boolean).join(' • ')}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-xs text-slate-500">
            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Member Since</span>
                <span className="font-semibold text-slate-800">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">Last Login</span>
                <span className="font-semibold text-slate-800">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'personal'
              ? 'bg-brand-50 text-brand-700 shadow-sm font-bold border border-brand-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('photo')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'photo'
              ? 'bg-brand-50 text-brand-700 shadow-sm font-bold border border-brand-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Profile Picture</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('password')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'password'
              ? 'bg-brand-50 text-brand-700 shadow-sm font-bold border border-brand-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Change Password</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-brand-50 text-brand-700 shadow-sm font-bold border border-brand-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Security & Session</span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      <div className="space-y-6">
        {/* SECTION 2: PERSONAL INFORMATION */}
        {activeTab === 'personal' && (
          <Card
            title="Personal Information"
            subtitle="View and update your academic administrative profile details."
            action={
              !isEditingInfo && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingInfo(true)}
                >
                  Edit Information
                </Button>
              )
            }
          >
            <form onSubmit={handleInfoSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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
                      value={infoForm.fullName}
                      onChange={handleInfoChange}
                      disabled={!isEditingInfo}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all ${
                        isEditingInfo
                          ? 'bg-white border-slate-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                      } ${infoErrors.fullName ? 'border-rose-400' : ''}`}
                    />
                  </div>
                  {infoErrors.fullName && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">
                      {infoErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Email Address (Read-only) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-slate-400 font-normal">(Primary Identifier)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={infoForm.phone}
                      onChange={handleInfoChange}
                      disabled={!isEditingInfo}
                      placeholder="Enter your phone number"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all ${
                        isEditingInfo
                          ? 'bg-white border-slate-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="department"
                      value={infoForm.department}
                      onChange={handleInfoChange}
                      disabled={!isEditingInfo}
                      placeholder="Enter department"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all ${
                        isEditingInfo
                          ? 'bg-white border-slate-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>

                {/* Designation */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Designation / Title
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      name="designation"
                      value={infoForm.designation}
                      onChange={handleInfoChange}
                      disabled={!isEditingInfo}
                      placeholder="Enter designation"
                      className={`w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border transition-all ${
                        isEditingInfo
                          ? 'bg-white border-slate-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                          : 'bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Edit Action Buttons */}
              {isEditingInfo && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={handleInfoCancel}
                    disabled={infoLoading}
                    icon={X}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={infoLoading}
                    icon={Save}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        )}

        {/* SECTION 3: PROFILE PHOTO */}
        {activeTab === 'photo' && (
          <Card
            title="Profile Picture"
            subtitle="Upload, preview, or remove your administrator avatar."
          >
            {photoError && (
              <Alert type="error" message={photoError} className="mb-6" />
            )}

            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Photo Preview Canvas */}
              <div className="flex flex-col items-center">
                <div className="w-36 h-36 rounded-3xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative shadow-sm">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-slate-400">
                      <Camera className="w-10 h-10 mx-auto mb-1 text-slate-300" />
                      <span className="text-xs">No Photo</span>
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-slate-400 mt-2 font-medium">
                  Square format recommended
                </span>
              </div>

              {/* Upload Controls */}
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Select New Picture
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Supported formats: PNG, JPG, JPEG, WEBP. Maximum file size: 2MB.
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Camera}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Photo
                  </Button>

                  {photoPreview && photoPreview !== user.avatar && (
                    <Button
                      variant="primary"
                      size="sm"
                      isLoading={photoLoading}
                      onClick={handleSavePhoto}
                      icon={Save}
                    >
                      Save Picture
                    </Button>
                  )}

                  {user.avatar && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      isLoading={photoLoading}
                      onClick={handleRemovePhoto}
                    >
                      Remove Picture
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* SECTION 4: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <Card
            title="Change Password"
            subtitle="Update your administrator login credentials securely."
          >
            <form onSubmit={handlePasswordSubmit} noValidate className="max-w-xl space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    placeholder="Enter current password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      passwordErrors.currentPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    placeholder="Enter new password (min. 6 characters)"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      passwordErrors.newPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>

              {/* Password Strength Indicator */}
              {passwordForm.newPassword && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Password Strength:</span>
                    <span className={passwordStrength.score >= 3 ? 'text-emerald-600' : 'text-amber-600'}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} ${passwordStrength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}

              {/* Confirm New Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmNewPassword: e.target.value })
                    }
                    placeholder="Confirm new password"
                    className={`w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                      passwordErrors.confirmNewPassword
                        ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmNewPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium">
                    {passwordErrors.confirmNewPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={passwordLoading}
                  icon={Save}
                >
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* SECTION 5: ACCOUNT SECURITY */}
        {activeTab === 'security' && (
          <Card
            title="Account Security & Session"
            subtitle="Monitor authentication metadata and session details."
          >
            <div className="space-y-6 max-w-xl">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Status</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {user.status || 'Active'}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Account Role</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {user.role}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Created On</span>
                  <span className="font-semibold text-slate-800">
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Last Authenticated</span>
                  <span className="font-semibold text-slate-800">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Current Session'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button
                  variant="danger"
                  icon={LogOut}
                  onClick={logout}
                >
                  Terminate Active Session
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;

