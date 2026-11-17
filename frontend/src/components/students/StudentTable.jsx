import React, { useState, useMemo } from 'react';
import {
  Edit2,
  Trash2,
  Mail,
  Phone,
  BookOpen,
  Hash,
  UserX,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import Button from '../common/Button';
import LoadingSpinner from '../common/LoadingSpinner';
import StudentDetailsModal from './StudentDetailsModal';

export const StudentTable = ({
  students = [],
  isLoading = false,
  onEdit,
  onDelete,
  onOpenAddModal,
  searchQuery = '',
  onClearFilters,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedStudentForView, setSelectedStudentForView] = useState(null);

  // Reset pagination if students list changes size significantly or if search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [students.length, searchQuery]);

  const totalPages = Math.ceil(students.length / pageSize) || 1;

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return students.slice(start, start + pageSize);
  }, [students, currentPage, pageSize]);

  if (isLoading) {
    return (
      <div className="py-20 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
        <LoadingSpinner text="Loading student records..." />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center ring-8 ring-brand-50/50">
          <UserX className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-midnight-950 mb-1">
          {searchQuery ? 'No matching students found' : 'No students registered yet'}
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          {searchQuery
            ? `We couldn't find any student matching "${searchQuery}". Try adjusting your search query or filters.`
            : 'Get started by registering the first student into EduManage.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          {searchQuery && onClearFilters && (
            <Button variant="secondary" onClick={onClearFilters}>
              Clear Filters
            </Button>
          )}
          {onOpenAddModal && !searchQuery && (
            <Button variant="primary" onClick={onOpenAddModal}>
              Register First Student
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Generate initials for student avatar
  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Consistent color badge per name
  const getAvatarBg = (name) => {
    const colors = [
      'bg-brand-600 text-white',
      'bg-indigo-600 text-white',
      'bg-cyan-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-rose-600 text-white',
      'bg-violet-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-100 shadow-soft-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th scope="col" className="px-6 py-4">Student</th>
                <th scope="col" className="px-6 py-4">Registration No.</th>
                <th scope="col" className="px-6 py-4">Course & Term</th>
                <th scope="col" className="px-6 py-4">Contact</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedStudents.map((student) => (
                <tr
                  key={student._id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => setSelectedStudentForView(student)}
                >
                  {/* Name and Avatar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-soft-xs ${getAvatarBg(
                          student.studentName
                        )}`}
                      >
                        {getInitials(student.studentName)}
                      </div>
                      <div>
                        <div className="font-bold text-midnight-950 group-hover:text-brand-600 transition-colors">
                          {student.studentName}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {student.createdAt
                              ? new Date(student.createdAt).toLocaleDateString()
                              : 'Registered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Registration Number */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200/60">
                      <Hash className="w-3 h-3 text-slate-400" />
                      {student.registrationNumber}
                    </span>
                  </td>

                  {/* Course & Semester */}
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-800">
                      {student.course}
                    </div>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">
                        Semester {student.semester}
                      </span>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <a
                        href={`mailto:${student.email}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[190px]">{student.email}</span>
                      </a>
                      <a
                        href={`tel:${student.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-brand-600 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedStudentForView(student)}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                        title="View Details"
                        aria-label={`View details of ${student.studentName}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(student)}
                        className="p-2 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                        title="Edit Student"
                        aria-label={`Edit ${student.studentName}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(student)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Student"
                        aria-label={`Delete ${student.studentName}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout (Visible only on smaller screens) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {paginatedStudents.map((student) => (
          <div
            key={student._id}
            className="bg-white rounded-2xl border border-slate-100 shadow-soft-sm p-4 space-y-3 cursor-pointer"
            onClick={() => setSelectedStudentForView(student)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-soft-xs ${getAvatarBg(
                    student.studentName
                  )}`}
                >
                  {getInitials(student.studentName)}
                </div>
                <div>
                  <h4 className="font-bold text-midnight-950">{student.studentName}</h4>
                  <span className="inline-flex items-center gap-1 mt-0.5 text-xs font-mono font-semibold text-slate-500">
                    <Hash className="w-3 h-3 text-slate-400" />
                    {student.registrationNumber}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                  aria-label="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Course</span>
                <span className="font-semibold text-slate-800">{student.course}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Semester</span>
                <span className="font-semibold text-brand-600">Semester {student.semester}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-xs text-slate-600">
              <a
                href={`mailto:${student.email}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 truncate"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </a>
              <a
                href={`tel:${student.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-soft-sm text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="py-1 px-2 border border-slate-200 rounded-lg text-xs bg-slate-50 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline">
              | Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, students.length)} of {students.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - currentPage) <= 1
              )
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] h-8 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-brand-500 text-white shadow-soft-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Student Details Modal */}
      <StudentDetailsModal
        isOpen={Boolean(selectedStudentForView)}
        onClose={() => setSelectedStudentForView(null)}
        student={selectedStudentForView}
        onEdit={(st) => {
          setSelectedStudentForView(null);
          onEdit(st);
        }}
        onDelete={(st) => {
          setSelectedStudentForView(null);
          onDelete(st);
        }}
      />
    </div>
  );
};

export default StudentTable;
