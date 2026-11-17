import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, CheckCircle2, AlertCircle, Hash, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import { studentService } from '../api/studentService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export const AddStudentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    studentName: '',
    registrationNumber: '',
    email: '',
    phone: '',
    course: '',
    semester: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);

  const validate = (data) => {
    const errs = {};
    if (!data.studentName?.trim()) errs.studentName = 'Student name is required.';
    else if (data.studentName.trim().length < 2) errs.studentName = 'Name must be at least 2 characters.';

    if (!data.registrationNumber?.trim()) errs.registrationNumber = 'Registration number is required.';

    if (!data.email?.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errs.email = 'Please provide a valid email format.';
    }

    if (!data.phone?.trim()) errs.phone = 'Phone number is required.';
    if (!data.course?.trim()) errs.course = 'Course is required.';

    if (!data.semester) errs.semester = 'Semester is required.';
    else {
      const s = Number(data.semester);
      if (isNaN(s) || s < 1 || s > 12) errs.semester = 'Semester must be between 1 and 12.';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    if (touched[name]) {
      const errs = validate(updated);
      setErrors((prev) => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const errs = validate(formData);
    setErrors((prev) => ({ ...prev, [name]: errs[name] }));
  };

  const handleSubmit = async (e) => {
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
      setIsLoading(true);
      setServerError(null);

      try {
        const payload = {
          studentName: formData.studentName.trim(),
          registrationNumber: formData.registrationNumber.trim().toUpperCase(),
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone.trim(),
          course: formData.course.trim(),
          semester: Number(formData.semester),
        };

        await studentService.createStudent(payload);
        navigate('/', { state: { message: `Student '${payload.studentName}' created successfully!` } });
      } catch (err) {
        setServerError(err.message || 'Failed to create student. Please check input fields.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      <Card
        title="Register New Student"
        subtitle="Fill in the student details to enroll into the directory."
      >
        {serverError && (
          <Alert type="error" message={serverError} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your full name"
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.studentName && touched.studentName
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.studentName && touched.studentName && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.studentName}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Registration Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter registration number"
                className={`w-full px-4 py-2.5 text-sm uppercase bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.registrationNumber && touched.registrationNumber
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.registrationNumber && touched.registrationNumber && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.registrationNumber}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester (1 - 12) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                name="semester"
                min="1"
                max="12"
                value={formData.semester}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter semester (1 - 12)"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.semester && touched.semester
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.semester && touched.semester && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.semester}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email address"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.email && touched.email
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your phone number"
                className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  errors.phone && touched.phone
                    ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
                }`}
              />
              {errors.phone && touched.phone && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.phone}</span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Course / Degree <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter course name"
              className={`w-full px-4 py-2.5 text-sm bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.course && touched.course
                  ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-brand-500/20 focus:border-brand-500'
              }`}
            />
            {errors.course && touched.course && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.course}</span>
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              icon={UserPlus}
            >
              Register Student
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddStudentPage;

