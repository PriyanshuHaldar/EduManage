import React from 'react';
import { Users, BookOpen, Layers, CheckCircle2, TrendingUp, Sparkles, Activity } from 'lucide-react';

export const StatsOverview = ({ students = [], isLoading = false }) => {
  const totalStudents = students.length;

  const uniqueCourses = Array.from(
    new Set(students.map((s) => s.course?.trim()).filter(Boolean))
  );

  const activeSemesters = Array.from(
    new Set(students.map((s) => s.semester).filter((sem) => sem !== undefined && sem !== null))
  );

  const stats = [
    {
      title: 'Total Enrolled',
      value: isLoading ? '...' : totalStudents,
      label: totalStudents === 1 ? 'Registered Student' : 'Active Students',
      trend: totalStudents > 0 ? '+100% active' : 'Awaiting records',
      icon: Users,
      cardGradient: 'from-brand-500/10 via-brand-500/5 to-transparent',
      iconBg: 'bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-brand',
      accentColor: 'text-brand-600',
    },
    {
      title: 'Active Programs',
      value: isLoading ? '...' : uniqueCourses.length,
      label: uniqueCourses.length > 0 ? `${uniqueCourses.length} Degree Tracks` : 'No Programs Yet',
      trend: 'Dynamic curricula',
      icon: BookOpen,
      cardGradient: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-teal-500 text-white shadow-cyan',
      accentColor: 'text-cyan-600',
    },
    {
      title: 'Active Semesters',
      value: isLoading ? '...' : activeSemesters.length,
      label: activeSemesters.length > 0 ? `Levels 1 through ${Math.max(...activeSemesters)}` : 'No active semesters',
      trend: 'Academic progress',
      icon: Layers,
      cardGradient: 'from-purple-500/10 via-purple-500/5 to-transparent',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-soft',
      accentColor: 'text-purple-600',
    },
    {
      title: 'Academic Standing',
      value: isLoading ? '...' : (totalStudents > 0 ? '100%' : 'N/A'),
      label: totalStudents > 0 ? 'Verified Student Records' : 'No Roster Records',
      trend: 'Good standing',
      icon: CheckCircle2,
      cardGradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-soft',
      accentColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="relative bg-white rounded-2xl p-5 border border-slate-100 shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group"
        >
          {/* Subtle gradient accent background */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${stat.cardGradient} rounded-bl-full pointer-events-none transition-transform group-hover:scale-110 duration-500`} />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {stat.title}
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.iconBg} shadow-sm group-hover:rotate-6 transition-transform duration-300`}>
              <stat.icon className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1 relative z-10">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight">
                {stat.value}
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                {stat.trend}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate" title={stat.label}>
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
