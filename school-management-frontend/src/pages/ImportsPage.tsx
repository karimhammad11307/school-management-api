import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Loader2,
  Users,
  BookOpen,
  GraduationCap,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../api/client';
import { Teacher, ClassItem, Student, FullImportReport } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { StatusBadge } from '../components/common/Badge';

export const ImportsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { showApiError, showSuccess } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [report, setReport] = useState<FullImportReport | null>(null);

  const [activeTab, setActiveTab] = useState<'teachers' | 'classes' | 'students'>('teachers');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuditLog, setShowAuditLog] = useState(false);

  useEffect(() => {
    const fetchExistingData = async () => {
      try {
        const [t, c, s] = await Promise.all([
          api.teachers.list(),
          api.classes.list(),
          api.students.list(),
        ]);
        setTeachers(t);
        setClasses(c);
        setStudents(s);
      } catch {}
    };
    if (isAdmin) {
      fetchExistingData();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Admin Access Required</h3>
        <p className="text-sm text-slate-500">
          Only Administrators are authorized to upload and import CSV data.
        </p>
      </div>
    );
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const fileList = Array.from(files);
      const res = await api.imports.upload(fileList);
      setReport(res.report);
      setTeachers(res.teachers);
      setClasses(res.classes);
      setStudents(res.students);
      showSuccess(
        'Upload Successful',
        `Processed ${res.report.totals.totalRows} rows (${res.report.totals.created} created, ${res.report.totals.skipped} skipped, ${res.report.totals.rejected} rejected).`
      );
    } catch (err) {
      showApiError(err, 'Failed to import CSV');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const q = searchQuery.toLowerCase().trim();

  const filteredTeachers = teachers.filter(
    (t) => !q || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
  );

  const filteredClasses = classes.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      (c.teacher?.name && c.teacher.name.toLowerCase().includes(q))
  );

  const filteredStudents = students.filter(
    (s) =>
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.schoolClass?.name && s.schoolClass.name.toLowerCase().includes(q))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            CSV Import
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Upload CSV files for teachers, classes, or students to populate the database
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing CSV...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {report && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <span className="font-semibold text-slate-800">Latest Import Results:</span>
              <span className="flex items-center gap-1.5 text-slate-600">
                Total: <strong>{report.totals.totalRows}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Created: {report.totals.created}
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" />
                Skipped: {report.totals.skipped}
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                <XCircle className="w-3.5 h-3.5" />
                Rejected: {report.totals.rejected}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowAuditLog(!showAuditLog)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {showAuditLog ? 'Hide Row Details' : 'View Row Details'}
              {showAuditLog ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAuditLog && (
            <div className="pt-3 border-t border-slate-100 text-xs space-y-4">
              {(['teachers', 'classes', 'students'] as const).map((key) => {
                const sub = report[key];
                if (!sub || sub.rows.length === 0) return null;

                return (
                  <div key={key} className="space-y-1.5">
                    <div className="font-semibold text-slate-700 uppercase text-[11px] tracking-wider">
                      {key} Log ({sub.created} created, {sub.skipped} skipped, {sub.rejected} rejected)
                    </div>
                    <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-50 bg-slate-50/50">
                      {sub.rows.map((row) => (
                        <div key={row.rowNumber} className="p-2 flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400">#{row.rowNumber}</span>
                            <StatusBadge status={row.status} />
                            <span className="text-slate-700">{row.reason}</span>
                          </div>
                          <span className="font-mono text-slate-400 truncate max-w-xs">
                            {JSON.stringify(row.raw)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-b border-slate-200 gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'teachers'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Teachers ({teachers.length})
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'classes'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Classes ({classes.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Students ({students.length})
            </button>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full bg-transparent focus:outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'teachers' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Faculty Member</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Assigned Classes</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No teachers found. Upload a CSV to view data.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900">{t.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{t.email}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">
                        {t.classes?.length ?? 0} classes
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(t.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'classes' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Class Name</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Occupancy / Capacity</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No classes found. Upload a CSV to view data.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map((c) => {
                    const enrolled = c.students?.length ?? 0;
                    const percent = Math.min(100, Math.round((enrolled / (c.capacity || 1)) * 100));

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-medium text-slate-900">{c.name}</td>
                        <td className="py-3 px-4 text-slate-600 text-xs">{c.teacher?.name || 'Unassigned'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-700 w-24">
                              {enrolled} / {c.capacity} students
                            </span>
                            <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${percent >= 100 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-xs">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'students' && (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Enrolled Class</th>
                  <th className="py-3 px-4">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs">
                      No students found. Upload a CSV to view data.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">{s.email}</td>
                      <td className="py-3 px-4 text-slate-700 text-xs font-medium">
                        {s.schoolClass?.name || 'Assigned Class'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
