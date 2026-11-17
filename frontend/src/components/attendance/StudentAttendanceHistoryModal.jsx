import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Award,
  Hash,
  BookOpen,
  Layers,
  AlertCircle,
  FileText
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import { attendanceService } from '../../api/attendanceService';

export const StudentAttendanceHistoryModal = ({ isOpen, onClose, student }) => {
  const [historyData, setHistoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && student?._id) {
      const fetchHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const res = await attendanceService.getStudentHistory(student._id);
          setHistoryData(res);
        } catch (err) {
          setError(err.message || 'Failed to load student attendance history.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchHistory();
    } else {
      setHistoryData(null);
    }
  }, [isOpen, student]);

  if (!student) return null;

  const stats = historyData?.stats || {
    totalSessions: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    rate: 0
  };

  const records = historyData?.data || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-500" />
            Late
          </span>
        );
      case 'Leave':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <UserCheck className="w-3 h-3 text-blue-500" />
            Leave
          </span>
        );
      case 'Absent':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-500" />
            Absent
          </span>
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Attendance History"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Student Profile Overview */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50/80 to-indigo-50/40 border border-brand-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-soft-sm shrink-0">
              {student.studentName?.charAt(0) || 'S'}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-midnight-950">
                {student.studentName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200/60 font-semibold text-slate-700">
                  {student.registrationNumber}
                </span>
                <span>&bull;</span>
                <span>{student.course}</span>
                <span>&bull;</span>
                <span className="font-semibold text-brand-600">Semester {student.semester}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center bg-white px-3.5 py-2 rounded-xl border border-brand-100 shadow-soft-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Rate</span>
              <span className="text-xl font-extrabold text-brand-600">{stats.rate}%</span>
            </div>
          </div>
        </div>

        {/* Attendance Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Sessions</span>
            <span className="text-lg font-extrabold text-midnight-950 mt-0.5 block">{stats.totalSessions}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
            <span className="text-emerald-700 block text-[10px] uppercase font-bold">Present</span>
            <span className="text-lg font-extrabold text-emerald-700 mt-0.5 block">{stats.present}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
            <span className="text-amber-700 block text-[10px] uppercase font-bold">Late</span>
            <span className="text-lg font-extrabold text-amber-700 mt-0.5 block">{stats.late}</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-center">
            <span className="text-rose-700 block text-[10px] uppercase font-bold">Absent / Leave</span>
            <span className="text-lg font-extrabold text-rose-700 mt-0.5 block">{stats.absent + stats.leave}</span>
          </div>
        </div>

        {/* History Log Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recorded Session Log
            </h4>
            <span className="text-xs text-slate-400">
              {records.length} Date-wise Records
            </span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center bg-slate-50/50 rounded-2xl border border-slate-100">
              <LoadingSpinner text="Loading session history..." />
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          ) : records.length === 0 ? (
            <div className="py-12 px-4 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-600">No attendance records found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Attendance has not been recorded for this student on any date yet.
              </p>
            </div>
          ) : (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200/80 shadow-soft-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200/80 text-[10px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {records.map((rec) => (
                    <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {rec.dateString}
                      </td>
                      <td className="py-2.5 px-4">
                        {getStatusBadge(rec.status)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 truncate max-w-[200px]">
                        {rec.remarks || <span className="text-slate-300 italic">None</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default StudentAttendanceHistoryModal;

