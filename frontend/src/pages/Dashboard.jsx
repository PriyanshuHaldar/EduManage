import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Plus,
  RefreshCw,
  Download,
  Calendar,
  Sparkles,
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { studentService } from '../api/studentService';
import { useAuth } from '../context/AuthContext';
import StatsOverview from '../components/students/StatsOverview';
import SearchBar from '../components/students/SearchBar';
import StudentTable from '../components/students/StudentTable';
import StudentFormModal from '../components/students/StudentFormModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';
import Card from '../components/common/Card';

export const Dashboard = ({ isAddModalOpen: propIsAddModalOpen, setIsAddModalOpen: propSetIsAddModalOpen }) => {
  const { user, isAuthenticated } = useAuth();
  const outletCtx = useOutletContext() || {};
  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);

  const isAddModalOpen = propIsAddModalOpen !== undefined
    ? propIsAddModalOpen
    : (outletCtx.isAddModalOpen !== undefined ? outletCtx.isAddModalOpen : localAddModalOpen);

  const setIsAddModalOpen = propSetIsAddModalOpen !== undefined
    ? propSetIsAddModalOpen
    : (outletCtx.setIsAddModalOpen !== undefined ? outletCtx.setIsAddModalOpen : setLocalAddModalOpen);

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');

  // Modal & form states
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formServerError, setFormServerError] = useState(null);

  // Delete confirmation state
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch students from backend
  const fetchStudents = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await studentService.getAllStudents();
      setStudents(res.data || []);
    } catch (err) {
      if (err.status !== 401) {
        setApiError(err.message || 'Failed to load student records. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStudents();
    }
  }, [isAuthenticated]);

  // Derived filter options
  const coursesList = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.course?.trim()) set.add(s.course.trim());
    });
    return Array.from(set).sort();
  }, [students]);

  const semestersList = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.semester) set.add(s.semester);
    });
    return Array.from(set).sort((a, b) => a - b);
  }, [students]);

  // Filter students based on search query, course, and semester
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        s.studentName?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase().trim());

      const matchesCourse =
        !selectedCourse ||
        s.course?.toLowerCase() === selectedCourse.toLowerCase();

      const matchesSemester =
        !selectedSemester ||
        s.semester?.toString() === selectedSemester.toString();

      return matchesSearch && matchesCourse && matchesSemester;
    });
  }, [students, searchQuery, selectedCourse, selectedSemester]);

  // Recent activity list derived from real records
  const recentActivities = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);
  }, [students]);

  // CSV Export utility
  const handleExportCSV = () => {
    if (!students.length) {
      showToast('No student records available to export.', 'error');
      return;
    }
    const headers = ['Student Name', 'Registration Number', 'Email', 'Phone', 'Course', 'Semester', 'Enrolled Date'];
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
    link.setAttribute('download', `EduManage_Students_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student directory exported to CSV.');
  };

  // Handle Form Submission (Add or Edit)
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    setFormServerError(null);

    try {
      if (studentToEdit) {
        const res = await studentService.updateStudent(studentToEdit._id, formData);
        setStudents((prev) =>
          prev.map((s) => (s._id === studentToEdit._id ? res.data : s))
        );
        showToast(res.message || 'Student updated successfully!');
      } else {
        const res = await studentService.createStudent(formData);
        setStudents((prev) => [res.data, ...prev]);
        showToast(res.message || 'Student enrolled successfully!');
      }

      setIsAddModalOpen(false);
      setStudentToEdit(null);
    } catch (err) {
      setFormServerError(err.message || 'Failed to save student details. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await studentService.deleteStudent(studentToDelete._id);
      setStudents((prev) => prev.filter((s) => s._id !== studentToDelete._id));
      showToast(res.message || `Student '${studentToDelete.studentName}' deleted.`);
      setStudentToDelete(null);
    } catch (err) {
      showToast(err.message || 'Failed to delete student.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const showToast = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => {
      setSuccessMessage((current) => (current === msg ? null : current));
    }, 5000);
  };

  const handleOpenEdit = (student) => {
    setStudentToEdit(student);
    setFormServerError(null);
    setIsAddModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setStudentToEdit(null);
    setFormServerError(null);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCourse('');
    setSelectedSemester('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-midnight-950 via-midnight-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-white/10">
        {/* Decorative background glows */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -mb-8 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md text-cyan-300 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                EduManage Campus Portal
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Current Academic Term
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              {getGreeting()}, {user?.fullName || 'Administrator'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Welcome to the university control center. Monitor admissions, course cohorts, and institutional analytics in real time.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold backdrop-blur-md border border-white/10 transition-all flex items-center gap-2 cursor-pointer shadow-soft-xs"
              title="Download directory as CSV"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={fetchStudents}
              disabled={isLoading}
              className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl backdrop-blur-md border border-white/10 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh student records"
            >
              <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => {
                setStudentToEdit(null);
                setFormServerError(null);
                setIsAddModalOpen(true);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-brand hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <Alert
          type="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={() => setApiError(null)}
        />
      )}

      {/* 4 Stat Overview Cards with Gradients */}
      <StatsOverview students={students} isLoading={isLoading} />

      {/* Visual Analytics Section (Recharts) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-brand-50 text-brand-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-midnight-950">
              Academic & Enrollment Intelligence
            </h2>
          </div>
          <Link
            to="/reports"
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            Full Analytics <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <AnalyticsCharts students={students} isLoading={isLoading} />
      </div>

      {/* Student Directory Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold text-midnight-950">
              Student Directory
            </h2>
            <p className="text-xs text-slate-500">
              Manage enrollments, academic progression, and student communications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {filteredStudents.length} Active Records
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft-sm">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            selectedSemester={selectedSemester}
            setSelectedSemester={setSelectedSemester}
            courses={coursesList}
            semesters={semestersList}
            totalResults={filteredStudents.length}
            totalStudents={students.length}
            onClearFilters={clearAllFilters}
          />
        </div>

        {/* Student Table */}
        <StudentTable
          students={filteredStudents}
          isLoading={isLoading}
          onEdit={handleOpenEdit}
          onDelete={(student) => setStudentToDelete(student)}
          onOpenAddModal={() => {
            setStudentToEdit(null);
            setIsAddModalOpen(true);
          }}
          searchQuery={searchQuery}
          onClearFilters={clearAllFilters}
        />
      </div>

      {/* Recent Activity Timeline & System Status Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registrations Timeline */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-midnight-950">Recent Enrollment Activity</h3>
                <p className="text-xs text-slate-400">Latest student enrollments</p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-slate-400">
              {recentActivities.length} Recent
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recent enrollment activity to display.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentActivities.map((act) => (
                <div key={act._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {act.studentName?.charAt(0) || 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-midnight-950 truncate">
                        {act.studentName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        Enrolled in {act.course} &bull; Semester {act.semester}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-slate-500 block">
                      {act.registrationNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {act.createdAt
                        ? new Date(act.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'Recent'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Academic Shortcuts Card */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-midnight-950">Academic Shortcuts</h3>
                <p className="text-xs text-slate-400">Quick access to university modules</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <Link
                to="/courses"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-700 font-semibold group-hover:text-brand-600">
                  <BookOpen className="w-4 h-4 text-brand-500" />
                  <span>Course Management</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/attendance"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-700 font-semibold group-hover:text-brand-600">
                  <Calendar className="w-4 h-4 text-emerald-500" />
                  <span>Attendance Register</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                to="/reports"
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-2 text-slate-700 font-semibold group-hover:text-brand-600">
                  <TrendingUp className="w-4 h-4 text-cyan-500" />
                  <span>Institutional Reports</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/settings"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center justify-between"
            >
              <span>Platform Settings</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Add / Edit Student Modal */}
      <StudentFormModal
        isOpen={isAddModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        studentToEdit={studentToEdit}
        isLoading={formLoading}
        serverError={formServerError}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student Record"
        message={`Are you sure you want to delete ${studentToDelete?.studentName} (${studentToDelete?.registrationNumber})? This record will be permanently removed.`}
        confirmText="Confirm Delete"
        isLoading={deleteLoading}
      />
    </div>
  );
};

export default Dashboard;
