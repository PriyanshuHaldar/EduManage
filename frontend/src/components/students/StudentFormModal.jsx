import React, { useState, useEffect } from 'react';
import { User, Hash, Mail, Phone, BookOpen, Layers, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Alert from '../common/Alert';

const INITIAL_FORM_STATE = {
  studentName: '',
  registrationNumber: '',
  email: '',
  phone: '',
  course: '',
  semester: '',
};

export const StudentFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  studentToEdit = null,
  isLoading = false,
  serverError = null,
}) => {
  const isEditing = Boolean(studentToEdit);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        studentName: studentToEdit.studentName || '',
        registrationNumber: studentToEdit.registrationNumber || '',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        course: studentToEdit.course || '',
        semester: studentToEdit.semester !== undefined ? studentToEdit.semester.toString() : '',
      });
    } else {
      setFormData(INITIAL_FORM_STATE);
    }
    setErrors({});
    setTouched({});
  }, [studentToEdit, isOpen]);

  // Client-side validation function
  const validate = (data) => {
    const newErrors = {};

    if (!data.studentName?.trim()) {
      newErrors.studentName = 'Student name is required.';
    } else if (data.studentName.trim().length < 2) {
      newErrors.studentName = 'Name must be at least 2 characters long.';
    }

    if (!data.registrationNumber?.trim()) {
      newErrors.registrationNumber = 'Registration number is required.';
    }

    if (!data.email?.trim()) {
      newErrors.email = 'Email address is required.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        newErrors.email = 'Please provide a valid email format (e.g. name@university.edu).';
      }
    }

    if (!data.phone?.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    if (!data.course?.trim()) {
      newErrors.course = 'Course name is required.';
    }

    if (!data.semester) {
      newErrors.semester = 'Semester is required.';
    } else {
      const semNum = Number(data.semester);
      if (isNaN(semNum) || semNum < 1 || semNum > 12) {
        newErrors.semester = 'Semester must be a number between 1 and 12.';
      }
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    // Live validation if the field was already touched
    if (touched[name]) {
      const currentErrors = validate(updated);
      setErrors((prev) => ({
        ...prev,
        [name]: currentErrors[name],
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const currentErrors = validate(formData);
    setErrors((prev) => ({
      ...prev,
      [name]: currentErrors[name],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate(formData);
    setErrors(validationErrors);
    setTouched({
      studentName: true,
      registrationNumber: true,
      email: true,
      phone: true,
      course: true,
      semester: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      // Format data before submitting
      const payload = {
        studentName: formData.studentName.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        course: formData.course.trim(),
        semester: Number(formData.semester),
      };
      onSubmit(payload);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Student Details' : 'Register New Student'}
      subtitle={
        isEditing
          ? `Updating records for registration #${formData.registrationNumber || '...'}`
          : 'Fill in the information below to register a student.'
      }
    >
      {serverError && (
        <Alert
          type="error"
          message={serverError}
          className="mb-5"
        />
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Student Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.studentName && touched.studentName
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
          </div>
          {errors.studentName && touched.studentName && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.studentName}</span>
            </p>
          )}
        </div>

        {/* Registration Number & Semester (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Registration No. <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter registration number"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm uppercase bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.registrationNumber && touched.registrationNumber
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.registrationNumber && touched.registrationNumber && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.registrationNumber}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Semester (1 - 12) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="semester"
                min="1"
                max="12"
                value={formData.semester}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter semester (1 - 12)"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.semester && touched.semester
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.semester && touched.semester && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.semester}</span>
              </p>
            )}
          </div>
        </div>

        {/* Email & Phone (2 cols) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email address"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.email && touched.email
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your phone number"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.phone && touched.phone
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
            </div>
            {errors.phone && touched.phone && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.phone}</span>
              </p>
            )}
          </div>
        </div>

        {/* Course Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Course / Degree Program <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter course name"
              className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.course && touched.course
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
          </div>
          {errors.course && touched.course && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.course}</span>
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {isEditing ? 'Save Changes' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentFormModal;

