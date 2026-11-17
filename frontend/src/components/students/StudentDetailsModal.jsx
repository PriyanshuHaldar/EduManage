import React from 'react';
import {
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  Calendar,
  Layers,
  Edit2,
  Trash2,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const StudentDetailsModal = ({
  isOpen,
  onClose,
  student,
  onEdit,
  onDelete,
}) => {
  if (!student) return null;

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Student Record Profile"
      maxWidth="max-w-md"
    >
      <div className="space-y-6">
        {/* Header with Avatar & Badge */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-brand-50/80 to-indigo-50/50 border border-brand-100/60">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xl shadow-brand shrink-0">
            {getInitials(student.studentName)}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-extrabold text-midnight-950 truncate">
              {student.studentName}
            </h3>
            <p className="text-xs font-mono font-semibold text-slate-500 mt-0.5">
              ID: {student.registrationNumber}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Active Roster
              </span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Course Program
              </span>
              <div className="font-bold text-midnight-900 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                <span>{student.course}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Academic Level
              </span>
              <div className="font-bold text-midnight-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-brand-600" />
                <span>Semester {student.semester}</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Email Address
              </span>
              <a
                href={`mailto:${student.email}`}
                className="font-medium text-brand-600 hover:underline flex items-center gap-1.5 truncate"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{student.email}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Contact Phone
              </span>
              <a
                href={`tel:${student.phone}`}
                className="font-medium text-slate-700 hover:text-brand-600 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{student.phone}</span>
              </a>
            </div>
          </div>

          {student.createdAt && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] px-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Enrolled on {new Date(student.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="danger"
            size="sm"
            icon={Trash2}
            onClick={() => {
              onClose();
              onDelete(student);
            }}
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Edit2}
              onClick={() => {
                onClose();
                onEdit(student);
              }}
            >
              Edit Record
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudentDetailsModal;

