import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Users,
  Search,
  Plus,
  ArrowRight,
  GraduationCap,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import { studentService } from '../api/studentService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const CoursesPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await studentService.getAllStudents();
        setStudents(res.data || []);
      } catch (err) {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Aggregate courses from real MongoDB student records
  const courseList = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const name = s.course?.trim() || 'General Studies';
      if (!map[name]) {
        map[name] = {
          name,
          students: [],
          semesters: new Set(),
        };
      }
      map[name].students.push(s);
      if (s.semester) map[name].semesters.add(s.semester);
    });

    return Object.values(map).map((c) => ({
      name: c.name,
      studentCount: c.students.length,
      students: c.students,
      semesters: Array.from(c.semesters).sort((a, b) => a - b),
      percentage: students.length
        ? Math.round((c.students.length / students.length) * 100)
        : 0,
    }));
  }, [students]);

  // Filter courses by search term and semester
  const filteredCourses = useMemo(() => {
    return courseList.filter((c) => {
      const matchesSearch = c.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase().trim());
      const matchesSemester =
        !selectedSemesterFilter ||
        c.semesters.includes(Number(selectedSemesterFilter));
      return matchesSearch && matchesSemester;
    });
  }, [courseList, searchTerm, selectedSemesterFilter]);

  // Unique semesters across all courses
  const allSemesters = useMemo(() => {
    const set = new Set();
    courseList.forEach((c) => c.semesters.forEach((s) => set.add(s)));
    return Array.from(set).sort((a, b) => a - b);
  }, [courseList]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-50 text-brand-700 border border-brand-100">
              <BookOpen className="w-3 h-3 text-brand-600" />
              Curriculum & Programs
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-midnight-950 tracking-tight">
            Academic Courses
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Department curricula, semester distributions, and cohort enrollments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-soft-xs">
            {courseList.length} Active Courses &bull; {students.length} Students
          </span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-soft-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search academic programs and degrees..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSemesterFilter}
            onChange={(e) => setSelectedSemesterFilter(e.target.value)}
            className="py-2.5 pl-3 pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="">All Semesters</option>
            {allSemesters.map((sem) => (
              <option key={sem} value={sem}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Courses List */}
      {isLoading ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
          <LoadingSpinner text="Aggregating academic course data..." />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="py-16 px-4 bg-white rounded-2xl border border-slate-100 shadow-soft-sm text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-midnight-950 mb-1">No courses found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            {searchTerm || selectedSemesterFilter
              ? 'No courses match the current filter criteria.'
              : 'Course departments are dynamically populated when students are registered.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <Card
              key={idx}
              className="p-6 flex flex-col justify-between hover:shadow-soft-md transition-all group border-slate-100"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-soft-xs group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Cohort
                  </span>
                </div>

                <h3 className="text-base font-bold text-midnight-950 group-hover:text-brand-600 transition-colors mb-2">
                  {course.name}
                </h3>

                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span>Department Share</span>
                      <span className="font-bold text-midnight-900">{course.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-500 to-cyan-500 rounded-full"
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-2">
                    {course.semesters.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700"
                      >
                        Sem {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-600 font-semibold">
                  <Users className="w-4 h-4 text-brand-600" />
                  <span>
                    <strong className="text-midnight-950">{course.studentCount}</strong> students
                  </span>
                </div>

                <span className="text-[11px] font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  View Roster &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoursesPage;
