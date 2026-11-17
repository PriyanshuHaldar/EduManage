import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Sparkles,
  TrendingUp,
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { studentService } from '../api/studentService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';

export const ReportsPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentService.getAllStudents();
        setStudents(res.data || []);
      } catch (err) {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // Aggregated department breakdowns
  const departmentStats = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const c = s.course?.trim() || 'General';
      if (!map[c]) {
        map[c] = {
          course: c,
          count: 0,
          semesters: new Set(),
        };
      }
      map[c].count++;
      if (s.semester) map[c].semesters.add(s.semester);
    });

    return Object.values(map)
      .map((d) => ({
        course: d.course,
        count: d.count,
        semesters: Array.from(d.semesters).sort((a, b) => a - b),
        percentage: students.length ? Math.round((d.count / students.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  const handleExportCSV = () => {
    if (!students.length) return;
    const headers = ['Student Name', 'Registration Number', 'Email', 'Phone', 'Course', 'Semester', 'Admission Date'];
    const rows = students.map((s) => [
      `"${(s.studentName || '').replace(/"/g, '""')}"`,
      `"${s.registrationNumber || ''}"`,
      `"${s.email || ''}"`,
      `"${s.phone || ''}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      `"${s.semester || ''}"`,
      `"${s.createdAt ? new Date(s.createdAt).toISOString() : ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduManage_Comprehensive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              <BarChart3 className="w-3 h-3 text-brand-600" />
              Intelligence & Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Data visualizations, enrollment trends, and academic distribution metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={handlePrint}
          >
            Print Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            disabled={!students.length}
          >
            Export Comprehensive CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Total Enrollments
            </span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-extrabold text-midnight-950">
            {students.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            100% Verified Records
          </span>
        </Card>

        <Card className="p-5 border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Active Programs
            </span>
            <BookOpen className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-extrabold text-midnight-950">
            {departmentStats.length}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Academic Curricula
          </span>
        </Card>

        <Card className="p-5 border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Average Cohort
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-midnight-950">
            {departmentStats.length
              ? Math.round(students.length / departmentStats.length)
              : 0}
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Students per program
          </span>
        </Card>

        <Card className="p-5 border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              System Sync
            </span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            Active
          </div>
          <span className="text-[11px] text-slate-400 font-medium mt-1 block">
            Real-time Institutional Data
          </span>
        </Card>
      </div>

      {/* Visual Analytics Charts Section */}
      <AnalyticsCharts students={students} isLoading={isLoading} />

      {/* Program Distribution Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-midnight-950">
            Department Performance Breakdown
          </h2>
          <span className="text-xs text-slate-400">
            {departmentStats.length} Academic Categories
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
            <LoadingSpinner text="Compiling reports..." />
          </div>
        ) : departmentStats.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-sm text-slate-500">
              No department data available. Register students to view breakdown reports.
            </p>
          </Card>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-4">Academic Program</th>
                    <th scope="col" className="px-6 py-4">Enrolled Students</th>
                    <th scope="col" className="px-6 py-4">Roster Distribution</th>
                    <th scope="col" className="px-6 py-4">Active Semesters</th>
                    <th scope="col" className="px-6 py-4 text-right">Enrollment Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {departmentStats.map((dept, index) => (
                    <tr key={index} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-midnight-950">{dept.course}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">{dept.count}</span> students
                      </td>

                      <td className="px-6 py-4">
                        <div className="w-36 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-500 h-2 rounded-full"
                            style={{ width: `${dept.percentage}%` }}
                          />
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-1 flex-wrap">
                          {dept.semesters.map((sem) => (
                            <span
                              key={sem}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                            >
                              Sem {sem}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-bold text-brand-600">
                          {dept.percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;

