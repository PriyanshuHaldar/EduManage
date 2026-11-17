import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  BarChart3,
  Settings,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, onOpenAddModal, isCollapsed, setIsCollapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const mainNav = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Students', to: '/students', icon: Users },
    { name: 'Courses', to: '/courses', icon: BookOpen },
    { name: 'Attendance', to: '/attendance', icon: CalendarCheck },
    { name: 'Analytics', to: '/reports', icon: BarChart3 },
  ];

  const adminNav = [
    { name: 'Profile', to: '/profile', icon: User },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    onClose?.();
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-midnight-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white border-r border-slate-100 shadow-soft-sm transition-all duration-300 ease-in-out flex flex-col justify-between p-3 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="space-y-6">
          {/* Main Navigation Group */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Core Modules
              </p>
            )}
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-brand font-bold'
                        : 'text-slate-600 hover:text-midnight-900 hover:bg-slate-50'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Quick Action */}
          {onOpenAddModal && (
            <div className="px-1">
              {isCollapsed ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onOpenAddModal();
                  }}
                  title="Add Student"
                  className="w-full h-10 flex items-center justify-center bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-brand transition-transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    onOpenAddModal();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-brand hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Enroll Student</span>
                </button>
              )}
            </div>
          )}

          {/* System & Settings Navigation Group */}
          <div>
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">
                Administration
              </p>
            )}
            <nav className="space-y-1">
              {adminNav.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  title={isCollapsed ? item.name : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 group ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-brand font-bold'
                        : 'text-slate-600 hover:text-midnight-900 hover:bg-slate-50'
                    } ${isCollapsed ? 'justify-center px-2' : ''}`
                  }
                >
                  <item.icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110`} />
                  {!isCollapsed && <span>{item.name}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer Area: Collapse Toggle & Profile Card */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          {/* Desktop Collapse Toggle */}
          <div className="hidden lg:flex justify-end px-1">
            <button
              type="button"
              onClick={() => setIsCollapsed?.((prev) => !prev)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-midnight-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-[11px] font-medium">Collapse</span>
                </>
              )}
            </button>
          </div>

          {/* User Profile Footer Card */}
          <div className={`p-2 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center gap-2 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            <NavLink
              to="/profile"
              onClick={onClose}
              title="Admin Profile"
              className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || 'Admin'}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-100 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-soft-sm">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
              )}

              {!isCollapsed && (
                <div className="min-w-0">
                  <p className="text-xs font-bold text-midnight-900 truncate">
                    {user?.fullName || 'Administrator'}
                  </p>
                  <p className="text-[10px] text-brand-600 font-semibold uppercase tracking-wider truncate">
                    {user?.role === 'superadmin' ? 'Super Admin' : (user?.role || 'Admin')}
                  </p>
                </div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
