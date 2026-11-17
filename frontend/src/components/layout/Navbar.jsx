import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
  Plus,
  Menu,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { studentService } from '../../api/studentService';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

export const Navbar = ({ onOpenAddModal, onToggleSidebar, isSidebarOpen, globalSearch, setGlobalSearch }) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-soft-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-500 hover:text-midnight-950 hover:bg-slate-100 lg:hidden focus:outline-none transition-colors cursor-pointer"
                aria-label="Toggle navigation"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 text-white flex items-center justify-center shadow-brand shadow-sm group-hover:scale-105 transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-extrabold tracking-tight text-midnight-950 block leading-tight">
                  Edu<span className="text-brand-500">Manage</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  University Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Global Search Bar */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={globalSearch || ''}
                  onChange={(e) => setGlobalSearch?.(e.target.value)}
                  placeholder="Global search students, courses, or IDs..."
                  className="w-full pl-10 pr-12 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-midnight-900 placeholder-slate-400"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-200/60 text-slate-500 border border-slate-300/40">
                    Ctrl K
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Right: Actions, Notifications, & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Add Student Button */}
            {isAuthenticated && onOpenAddModal && (
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={onOpenAddModal}
                className="hidden xs:inline-flex"
              >
                Add Student
              </Button>
            )}

            {/* Notification Menu */}
            {isAuthenticated && (
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  onClick={() => setNotificationOpen((prev) => !prev)}
                  className="p-2 rounded-xl text-slate-500 hover:text-midnight-950 hover:bg-slate-100 transition-colors relative cursor-pointer"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-soft-lg border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                      <span className="text-xs font-bold text-midnight-950 uppercase tracking-wider">
                        System Notifications
                      </span>
                      <span className="text-[10px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                        Live
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-midnight-900">EduManage Campus Portal</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Academic records synchronized and active.</p>
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-midnight-900">Session Protected</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">Secure administrator session active.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Admin Profile Dropdown */}
            {isAuthenticated && (
              <div className="relative pl-2 border-l border-slate-100" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group"
                  aria-expanded={profileDropdownOpen}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || 'Admin'}
                      className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-soft-sm">
                      {user?.fullName?.charAt(0) || 'A'}
                    </div>
                  )}

                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-midnight-900 leading-tight group-hover:text-brand-500 transition-colors">
                      {user?.fullName || 'Administrator'}
                    </span>
                    <span className="text-[10px] font-semibold text-brand-600 uppercase tracking-wider">
                      {user?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </div>

                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-midnight-900 transition-colors" />
                </button>

                {/* Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-soft-lg border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-midnight-900 truncate">
                        {user?.fullName || 'Administrator'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user?.email || 'admin@university.edu'}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-brand-500" />
                      <span>Admin Profile</span>
                    </Link>

                    <Link
                      to="/settings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Platform Settings</span>
                    </Link>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
