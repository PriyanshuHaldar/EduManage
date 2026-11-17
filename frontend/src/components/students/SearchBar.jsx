import React from 'react';
import { Search, X, Filter, RotateCcw } from 'lucide-react';

export const SearchBar = ({
  searchQuery,
  setSearchQuery,
  selectedCourse = '',
  setSelectedCourse = () => {},
  selectedSemester = '',
  setSelectedSemester = () => {},
  courses = [],
  semesters = [],
  totalResults = 0,
  totalStudents = 0,
  onClearFilters,
}) => {
  const hasActiveFilters = Boolean(
    searchQuery || selectedCourse || selectedSemester
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name or registration number..."
            className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-900 placeholder-slate-400 shadow-soft-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Course Filter */}
          <div className="relative min-w-[140px] flex-1 sm:flex-initial">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            >
              <option value="">All Courses</option>
              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className="relative min-w-[130px] flex-1 sm:flex-initial">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full py-2.5 pl-3 pr-8 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors"
            >
              <option value="">All Semesters</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center gap-1.5 shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results summary info badge */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Showing <span className="font-bold text-brand-600">{totalResults}</span> of {totalStudents} students
            {selectedCourse && <span> in <strong className="text-slate-800">{selectedCourse}</strong></span>}
            {selectedSemester && <span> (Semester {selectedSemester})</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
