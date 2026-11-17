import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CalendarCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Download,
  Save,
  Users,
  Search,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  History,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { studentService } from '../api/studentService';
import { attendanceService } from '../api/attendanceService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import StudentAttendanceHistoryModal from '../components/attendance/StudentAttendanceHistoryModal';

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const shiftDate = (dateString, days) => {
  const [y, m, d] = dateString.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const nextY = dt.getFullYear();
  const nextM = String(dt.getMonth() + 1).padStart(2, '0');
  const nextD = String(dt.getDate()).padStart(2, '0');
  return `${nextY}-${nextM}-${nextD}`;
};

export const AttendancePage = () => {
  const [students, setStudents] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // attendanceMap: studentId -> { status: 'Present' | 'Absent' | 'Late' | 'Leave' | null, remarks: string }
  const [attendanceMap, setAttendanceMap] = useState({});
  const [isDateSaved, setIsDateSaved] = useState(false);
  const [serverSummary, setServerSummary] = useState(null);

  const [notification, setNotification] = useState(null);
  const [historyStudent, setHistoryStudent] = useState(null);

  // 1. Fetch Students List once on mount
  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoadingStudents(true);
      try {
        const res = await studentService.getAllStudents();
        setStudents(res.data || []);
      } catch (err) {
        setNotification({
          type: 'error',
          message: err.message || 'Failed to load students roster.'
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  // 2. Fetch Date-wise Attendance whenever selectedDate changes
  const fetchAttendanceForDate = useCallback(async (dateStr) => {
    setIsLoadingAttendance(true);
    try {
      const res = await attendanceService.getAttendanceByDate(dateStr);
      const records = res.data || [];

      if (records.length > 0) {
        // Records exist for this date
        const newMap = {};
        records.forEach((rec) => {
          const sId = rec.student?._id || rec.student;
          newMap[sId] = {
            status: rec.status,
            remarks: rec.remarks || ''
          };
        });
        setAttendanceMap(newMap);
        setIsDateSaved(true);
        setServerSummary(res.summary);
      } else {
        // No records exist for this date -> Unmarked state
        setAttendanceMap({});
        setIsDateSaved(false);
        setServerSummary(null);
      }
    } catch (err) {
      setAttendanceMap({});
      setIsDateSaved(false);
      setServerSummary(null);
    } finally {
      setIsLoadingAttendance(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceForDate(selectedDate);
  }, [selectedDate, fetchAttendanceForDate]);

  // Unique Courses for filter dropdown
  const courses = useMemo(() => {
    const set = new Set();
    students.forEach((s) => {
      if (s.course?.trim()) set.add(s.course.trim());
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered Students list by course and search
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesCourse = !selectedCourse || s.course?.toLowerCase() === selectedCourse.toLowerCase();
      const matchesSearch = !searchQuery.trim() ||
        s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.registrationNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCourse && matchesSearch;
    });
  }, [students, selectedCourse, searchQuery]);

  // Real-time metrics calculation
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    let present = 0;
    let absent = 0;
    let late = 0;
    let leave = 0;
    let unmarked = 0;

    filteredStudents.forEach((s) => {
      const rec = attendanceMap[s._id];
      const status = rec?.status;
      if (status === 'Present') present++;
      else if (status === 'Absent') absent++;
      else if (status === 'Late') late++;
      else if (status === 'Leave') leave++;
      else unmarked++;
    });

    const markedCount = total - unmarked;
    const rate = markedCount > 0
      ? Math.round(((present + late * 0.5) / markedCount) * 100)
      : 0;

    return { total, present, absent, late, leave, unmarked, rate, markedCount };
  }, [filteredStudents, attendanceMap]);

  // Status updates
  const setStatusForStudent = (studentId, status) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status: prev[studentId]?.status === status ? null : status
      }
    }));
  };

  const setRemarksForStudent = (studentId, remarks) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { status: 'Present' }),
        remarks
      }
    }));
  };

  const markAll = (status) => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        updated[s._id] = {
          ...(updated[s._id] || {}),
          status
        };
      });
      return updated;
    });
    showToast(`Marked all ${filteredStudents.length} students as ${status}.`);
  };

  const clearAllMarks = () => {
    setAttendanceMap((prev) => {
      const updated = { ...prev };
      filteredStudents.forEach((s) => {
        delete updated[s._id];
      });
      return updated;
    });
    showToast('Cleared attendance selections for this session.');
  };

  // Save / Update Attendance
  const handleSaveAttendance = async () => {
    // Collect all marked students
    const recordsToSave = [];
    students.forEach((s) => {
      const rec = attendanceMap[s._id];
      if (rec && rec.status) {
        recordsToSave.push({
          studentId: s._id,
          status: rec.status,
          remarks: rec.remarks || ''
        });
      }
    });

    if (recordsToSave.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please mark attendance for at least one student before saving.'
      });
      return;
    }

    setIsSaving(true);
    setNotification(null);

    try {
      const res = await attendanceService.saveAttendance(selectedDate, recordsToSave);
      setIsDateSaved(true);
      setServerSummary(res.summary);
      showToast(`Attendance for ${selectedDate} has been saved successfully (${recordsToSave.length} students recorded).`);
      // Refetch to ensure sync with database
      await fetchAttendanceForDate(selectedDate);
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to save attendance records.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const showToast = (msg) => {
    setNotification({ type: 'success', message: msg });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === msg ? null : curr));
    }, 4500);
  };

  // CSV Export for the current date session
  const handleExportAttendance = () => {
    if (!filteredStudents.length) return;
    const headers = ['Date', 'Student Name', 'Registration Number', 'Course', 'Semester', 'Status', 'Remarks'];
    const rows = filteredStudents.map((s) => {
      const rec = attendanceMap[s._id] || {};
      return [
        `"${selectedDate}"`,
        `"${(s.studentName || '').replace(/"/g, '""')}"`,
        `"${s.registrationNumber || ''}"`,
        `"${(s.course || '').replace(/"/g, '""')}"`,
        `"${s.semester || ''}"`,
        `"${rec.status || 'Unmarked'}"`,
        `"${(rec.remarks || '').replace(/"/g, '""')}"`
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `EduManage_Attendance_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrevDay = () => setSelectedDate((prev) => shiftDate(prev, -1));
  const handleNextDay = () => setSelectedDate((prev) => shiftDate(prev, 1));
  const handleToday = () => setSelectedDate(getTodayDateString());

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              <CalendarCheck className="w-3 h-3 text-brand-600" />
              Date-wise Attendance Register
            </span>
            {isDateSaved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Records Saved in System
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                <Clock className="w-3 h-3 text-amber-600" />
                Unmarked Session
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight">
            Attendance Register
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage daily lecture sessions, preserve historical logs, and monitor attendance standing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportAttendance}
            disabled={!filteredStudents.length}
          >
            Export Sheet
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={handleSaveAttendance}
            disabled={isSaving || !filteredStudents.length}
            className={isSaving ? 'opacity-80 cursor-wait' : ''}
          >
            {isSaving ? 'Saving...' : isDateSaved ? 'Update Attendance' : 'Save Attendance'}
          </Button>
        </div>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Date Navigation & Filter Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft-sm space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Date Picker with Quick Prev/Next/Today */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-soft-xs">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg text-slate-500 hover:text-midnight-950 hover:bg-white transition-colors cursor-pointer"
                title="Previous Day"
                aria-label="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 px-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent border-none py-1 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg text-slate-500 hover:text-midnight-950 hover:bg-white transition-colors cursor-pointer"
                title="Next Day"
                aria-label="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleToday}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                selectedDate === getTodayDateString()
                  ? 'bg-brand-500 text-white shadow-soft-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Today
            </button>
          </div>

          {/* Course filter & Search */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full py-2 pl-3 pr-8 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="">All Academic Cohorts</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 sm:w-56">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student or ID..."
                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
        </div>

        {/* Batch Actions Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Batch Actions:</span>
            <button
              type="button"
              onClick={() => markAll('Present')}
              className="px-2.5 py-1 rounded-lg font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('Absent')}
              className="px-2.5 py-1 rounded-lg font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              All Absent
            </button>
            <button
              type="button"
              onClick={clearAllMarks}
              className="px-2.5 py-1 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Unmark All
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Selected Date: <strong className="text-slate-800">{selectedDate}</strong>
            {isDateSaved && <span className="ml-1 text-emerald-600 font-semibold">(Saved in database)</span>}
          </div>
        </div>
      </div>

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-4 border-slate-100">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Total Students
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-midnight-950">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400">enrolled</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 bg-emerald-50/20">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 block mb-1">
            Present
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-600">
              {stats.present}
            </span>
            <span className="text-xs text-emerald-700/70">confirmed</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 bg-amber-50/20">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 block mb-1">
            Late
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-amber-600">
              {stats.late}
            </span>
            <span className="text-xs text-amber-700/70">tardy</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 bg-rose-50/20">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 block mb-1">
            Absent
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-rose-600">
              {stats.absent}
            </span>
            <span className="text-xs text-rose-700/70">unexcused</span>
          </div>
        </Card>

        <Card className="p-4 border-slate-100 bg-blue-50/20">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block mb-1">
            Leave
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-blue-600">
              {stats.leave}
            </span>
            <span className="text-xs text-blue-700/70">excused</span>
          </div>
        </Card>
      </div>

      {/* Student Attendance Roster Table */}
      {isLoadingStudents || isLoadingAttendance ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
          <LoadingSpinner text={isLoadingStudents ? 'Loading student roster...' : 'Fetching date attendance records...'} />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-midnight-950 mb-1">
            No students found
          </h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {selectedCourse || searchQuery
              ? 'No students match your filter criteria.'
              : 'Add students in the Student Management module to track attendance.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-soft-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th scope="col" className="px-6 py-4">Student</th>
                  <th scope="col" className="px-6 py-4">Registration No.</th>
                  <th scope="col" className="px-6 py-4">Course Program</th>
                  <th scope="col" className="px-6 py-4 text-center">Mark Status</th>
                  <th scope="col" className="px-6 py-4">Session Remarks</th>
                  <th scope="col" className="px-6 py-4 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredStudents.map((student) => {
                  const rec = attendanceMap[student._id] || {};
                  const currentStatus = rec.status;

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Student Info */}
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-midnight-950">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-slate-400">
                          Semester {student.semester}
                        </div>
                      </td>

                      {/* Reg No */}
                      <td className="px-6 py-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {student.registrationNumber}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="px-6 py-3.5">
                        <span className="font-medium text-slate-800">
                          {student.course}
                        </span>
                      </td>

                      {/* Status Toggle Control */}
                      <td className="px-6 py-3.5 text-center">
                        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100/90 gap-1 border border-slate-200/60">
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(student._id, 'Present')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-500 text-white shadow-soft-xs'
                                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(student._id, 'Late')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-soft-xs'
                                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50/60'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(student._id, 'Absent')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-500 text-white shadow-soft-xs'
                                : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50/60'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusForStudent(student._id, 'Leave')}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === 'Leave'
                                ? 'bg-blue-500 text-white shadow-soft-xs'
                                : 'text-slate-600 hover:text-blue-700 hover:bg-blue-50/60'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>

                      {/* Remarks Input */}
                      <td className="px-6 py-3.5">
                        <input
                          type="text"
                          value={rec.remarks || ''}
                          onChange={(e) => setRemarksForStudent(student._id, e.target.value)}
                          placeholder="Optional notes..."
                          className="w-full max-w-[180px] px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-300 focus:outline-none focus:bg-white focus:ring-1 focus:ring-brand-500"
                        />
                      </td>

                      {/* Student Attendance History Action */}
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setHistoryStudent(student)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                          title="View Attendance History"
                          aria-label={`View attendance history of ${student.studentName}`}
                        >
                          <History className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student History Modal */}
      <StudentAttendanceHistoryModal
        isOpen={Boolean(historyStudent)}
        onClose={() => setHistoryStudent(null)}
        student={historyStudent}
      />
    </div>
  );
};

export default AttendancePage;
