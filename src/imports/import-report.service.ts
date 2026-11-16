import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

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

@Injectable()
export class ImportReportService {
  summarize(rows: RowReportEntry[]): EntityImportSummary {
    let created = 0;
    let skipped = 0;
    let rejected = 0;

    for (const row of rows) {
      if (row.status === 'created') created++;
      else if (row.status === 'skipped') skipped++;
      else rejected++;
    }

    return {
      totalRows: rows.length,
      created,
      skipped,
      rejected,
      rows,
    };
  }

  buildReport(
    sourceDir: string,
    teachers: EntityImportSummary,
    classes: EntityImportSummary,
    students: EntityImportSummary,
  ): FullImportReport {
    return {
      executedAt: new Date().toISOString(),
      sourceDir,
      totals: {
        totalRows: teachers.totalRows + classes.totalRows + students.totalRows,
        created: teachers.created + classes.created + students.created,
        skipped: teachers.skipped + classes.skipped + students.skipped,
        rejected: teachers.rejected + classes.rejected + students.rejected,
      },
      teachers,
      classes,
      students,
    };
  }

  async saveReport(report: FullImportReport, reportName?: string): Promise<string> {
    const reportsDir = path.resolve(process.cwd(), 'data', 'reports');
    await fs.mkdir(reportsDir, { recursive: true });

    const safeFileName = reportName
      ? path.basename(reportName)
      : `import-${Date.now()}.json`;

    const fullPath = path.join(reportsDir, safeFileName);
    report.reportFile = path.relative(process.cwd(), fullPath);

    await fs.writeFile(fullPath, JSON.stringify(report, null, 2), 'utf-8');
    return fullPath;
  }
}
