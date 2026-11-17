import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, Layers } from 'lucide-react';
import Card from '../common/Card';
import LoadingSkeleton from '../common/LoadingSkeleton';

// Palette matching our theme
const CHART_COLORS = [
  '#5546E8', // Electric Purple
  '#12B8C9', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Violet
  '#3B82F6', // Blue
];

// Custom Tooltip component for Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-midnight-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-white/10 text-xs">
        <p className="font-semibold text-slate-300 mb-1">{label || payload[0]?.name}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color || entry.fill }}
            />
            <span className="font-medium text-slate-200">
              {entry.name ? `${entry.name}: ` : ''}
              <span className="font-bold text-white">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts = ({ students = [], isLoading = false }) => {
  // 1. Course Distribution Data
  const courseData = useMemo(() => {
    if (!students.length) return [];
    const counts = {};
    students.forEach((s) => {
      const course = s.course?.trim() || 'General';
      counts[course] = (counts[course] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [students]);

  // 2. Semester Distribution Data
  const semesterData = useMemo(() => {
    if (!students.length) return [];
    const counts = {};
    students.forEach((s) => {
      const sem = s.semester ? `Sem ${s.semester}` : 'Unassigned';
      counts[sem] = (counts[sem] || 0) + 1;
    });
    // Sort semesters naturally
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        students: count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [students]);

  // 3. Enrollment Timeline Data (chronological)
  const timelineData = useMemo(() => {
    if (!students.length) return [];
    // Group by registration date or sequential batches
    const sorted = [...students].sort(
      (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
    );

    let cumulative = 0;
    const dateMap = {};

    sorted.forEach((s) => {
      const d = s.createdAt
        ? new Date(s.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          })
        : 'Registered';
      dateMap[d] = (dateMap[d] || 0) + 1;
    });

    return Object.entries(dateMap).map(([date, count]) => {
      cumulative += count;
      return {
        date,
        daily: count,
        total: cumulative,
      };
    });
  }, [students]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingSkeleton type="chart" />
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="p-8 text-center bg-white/70 backdrop-blur-sm border-dashed">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold text-midnight-950 mb-1">
          Analytics & Visual Reports
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Interactive charts for course distributions, semester breakdowns, and enrollment trends will display here as students are registered.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Enrollment Growth Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-midnight-950">Enrollment Growth</h3>
                <p className="text-xs text-slate-400">Cumulative student admissions</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 border border-brand-100">
              {students.length} Total
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5546E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#12B8C9" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Students"
                  stroke="#5546E8"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#enrollmentGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Course Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-midnight-950">Course Distribution</h3>
                <p className="text-xs text-slate-400">Student enrollment by department</p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
              {courseData.length} Courses
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                  data={courseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {courseData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      stroke="#FFFFFF"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span className="text-xs font-medium text-slate-700">{value}</span>
                  )}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Chart 3: Semester Breakdown */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-midnight-950">Semester Enrollment</h3>
              <p className="text-xs text-slate-400">Roster distribution across active academic terms</p>
            </div>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={semesterData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="students"
                name="Students Enrolled"
                fill="#5546E8"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;

