export type UserRole = 'admin' | 'operator' | 'teacher' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ApiErrorResponse {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  classes?: ClassItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassItem {
  id: string;
  name: string;
  capacity: number;
  teacherId: string;
  teacher?: Teacher;
  students?: Student[];
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  schoolClass?: ClassItem;
  createdAt: string;
  updatedAt: string;
}

export type RowOutcome = 'created' | 'skipped' | 'rejected';

export interface RowReportEntry {
  rowNumber: number;
  status: RowOutcome;
  reason: string;
  recordId?: string;
  raw: Record<string, string>;
  normalized?: Record<string, unknown>;
}

export interface EntityImportSummary {
  totalRows: number;
  created: number;
  skipped: number;
  rejected: number;
  rows: RowReportEntry[];
}

export interface FullImportReport {
  executedAt: string;
  sourceDir: string;
  reportFile?: string;
  totals: {
    totalRows: number;
    created: number;
    skipped: number;
    rejected: number;
  };
  teachers: EntityImportSummary;
  classes: EntityImportSummary;
  students: EntityImportSummary;
}

export interface UploadImportResponse {
  report: FullImportReport;
  teachers: Teacher[];
  classes: ClassItem[];
  students: Student[];
}

