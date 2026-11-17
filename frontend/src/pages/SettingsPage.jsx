import React, { useState } from 'react';
import {
  Settings,
  Building2,
  GraduationCap,
  Save,
  Bell,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';

export const SettingsPage = () => {
  const [institutionName, setInstitutionName] = useState('EduManage University Institute');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [term, setTerm] = useState('Spring Term');
  const [attendanceThreshold, setAttendanceThreshold] = useState('75');
  const [gradingScale, setGradingScale] = useState('4.0');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notification, setNotification] = useState(null);

  const handleSave = (e) => {
    e.preventDefault();
    setNotification({
      type: 'success',
      message: 'Institution platform preferences updated successfully.',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">
            <Settings className="w-3 h-3 text-brand-600" />
            Platform Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight">
          System & University Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage institutional defaults, grading parameters, and academic preferences.
        </p>
      </div>

      {notification && (
        <Alert
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institutional Profile */}
        <Card className="p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-midnight-950">University Information</h3>
              <p className="text-xs text-slate-400">Institutional identity across student transcripts and reports</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Institution Name
              </label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Enter university or institution name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Current Academic Year
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2024-2025"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Active Term / Semester
              </label>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
              >
                <option value="Fall Term">Fall Term</option>
                <option value="Spring Term">Spring Term</option>
                <option value="Summer Term">Summer Term</option>
                <option value="Winter Session">Winter Session</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Grading Standard
              </label>
              <select
                value={gradingScale}
                onChange={(e) => setGradingScale(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
              >
                <option value="4.0">4.0 GPA Scale</option>
                <option value="10.0">10.0 CGPA Scale</option>
                <option value="Percentage">Percentage (0-100%)</option>
                <option value="Letter">Letter Grades (A-F)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Section 2: Academic Requirements */}
        <Card className="p-6 border-slate-100 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-midnight-950">Academic Policies</h3>
              <p className="text-xs text-slate-400">Attendance thresholds and compliance alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">
                Minimum Attendance Requirement (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={attendanceThreshold}
                  onChange={(e) => setAttendanceThreshold(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-900"
                />
                <span className="text-slate-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Students below this percentage will be flagged for review.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <span className="text-slate-800 font-bold block">Admissions Email Notifications</span>
                <span className="text-[11px] text-slate-400">Notify admin on new student registrations</span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 cursor-pointer"
              />
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" icon={Save}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

