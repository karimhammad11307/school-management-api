import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { StudentEntity } from '../students/students.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { CsvParserService } from './csv-parser.service.js';
import { RunImportDto } from './dto/run-import.dto.js';
import {
  FullImportReport,
  ImportReportService,
  RowReportEntry,
} from './import-report.service.js';
import { RelationshipResolverService } from './relationship-resolver.service.js';
import { RowNormalizerService } from './row-normalizer.service.js';

@Injectable()
export class ImportsService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    private readonly csvParser: CsvParserService,
    private readonly normalizer: RowNormalizerService,
    private readonly resolver: RelationshipResolverService,
    private readonly reportService: ImportReportService,
  ) {}

  async runImport(dto: RunImportDto): Promise<FullImportReport> {
    const sourceDir = path.resolve(process.cwd(), dto.sourceDir || 'data/source');
    const teachersPath = path.join(sourceDir, 'teachers.csv');
    const classesPath = path.join(sourceDir, 'classes.csv');
    const studentsPath = path.join(sourceDir, 'students.csv');

    for (const filePath of [teachersPath, classesPath, studentsPath]) {
      if (!fs.existsSync(filePath)) {
        throw new BadRequestException(`Missing required CSV file: ${filePath}`);
      }
    }

    const teacherRows = await this.importTeachers(teachersPath);
    const classRows = await this.importClasses(classesPath);
    const studentRows = await this.importStudents(studentsPath);

    const report = this.reportService.buildReport(
      path.relative(process.cwd(), sourceDir),
      this.reportService.summarize(teacherRows),
      this.reportService.summarize(classRows),
      this.reportService.summarize(studentRows),
    );

    await this.reportService.saveReport(report, dto.reportName);
    return report;
  }

  private async importTeachers(filePath: string): Promise<RowReportEntry[]> {
    const parsedRows = await this.csvParser.parseFile(filePath);
    const entries: RowReportEntry[] = [];
    const seenEmailsInFile = new Map<string, string>();

    for (const row of parsedRows) {
      const name = this.normalizer.cleanText(
        this.normalizer.pickField(row.raw, ['name', 'teacher_name', 'full_name']),
      );
      const email = this.normalizer.normalizeEmail(
        this.normalizer.pickField(row.raw, ['email', 'teacher_email']),
      );

      if (!name || !email) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: 'Missing required teacher name or email',
          raw: row.raw,
        });
        continue;
      }

      if (!this.normalizer.isValidEmail(email)) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: `Invalid email format: "${email}"`,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }

      const previousNameInFile = seenEmailsInFile.get(email);
      if (previousNameInFile !== undefined) {
        const isConflict = previousNameInFile.toLowerCase() !== name.toLowerCase();
        entries.push({
          rowNumber: row.rowNumber,
          status: isConflict ? 'rejected' : 'skipped',
          reason: isConflict
            ? `Conflicting duplicate email "${email}" in CSV (previous name: "${previousNameInFile}")`
            : `Duplicate teacher email "${email}" in CSV`,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }
      seenEmailsInFile.set(email, name);

      const existing = await this.teacherRepo
        .createQueryBuilder('t')
        .where('LOWER(t.email) = :email', { email })
        .getOne();

      if (existing) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'skipped',
          reason: `Teacher with email "${email}" already exists in database`,
          recordId: existing.id,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }

      const saved = await this.teacherRepo.save(
        this.teacherRepo.create({ name, email }),
      );

      entries.push({
        rowNumber: row.rowNumber,
        status: 'created',
        reason: 'Created teacher',
        recordId: saved.id,
        raw: row.raw,
        normalized: { name, email },
      });
    }

    return entries;
  }

  private async importClasses(filePath: string): Promise<RowReportEntry[]> {
    const parsedRows = await this.csvParser.parseFile(filePath);
    const entries: RowReportEntry[] = [];
    const seenClassesInFile = new Set<string>();

    for (const row of parsedRows) {
      const name = this.normalizer.cleanText(
        this.normalizer.pickField(row.raw, ['name', 'class_name', 'class']),
      );
      const capacityRaw = this.normalizer.pickField(row.raw, ['capacity', 'max_capacity']);
      const teacherEmailRaw = this.normalizer.pickField(row.raw, ['teacher_email', 'email']);
      const teacherNameRaw = this.normalizer.pickField(row.raw, ['teacher_name', 'teacher']);

      const capacity = this.normalizer.parsePositiveInt(capacityRaw);

      if (!name) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: 'Missing required class name',
          raw: row.raw,
        });
        continue;
      }

      if (capacity === null) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: `Invalid class capacity: "${capacityRaw}"`,
          raw: row.raw,
          normalized: { name },
        });
        continue;
      }

      const classKey = name.toLowerCase();
      if (seenClassesInFile.has(classKey)) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'skipped',
          reason: `Duplicate class "${name}" in CSV`,
          raw: row.raw,
          normalized: { name, capacity },
        });
        continue;
      }
      seenClassesInFile.add(classKey);

      const existing = await this.classRepo
        .createQueryBuilder('c')
        .where('LOWER(c.name) = :name', { name: classKey })
        .getOne();

      if (existing) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'skipped',
          reason: `Class "${name}" already exists in database`,
          recordId: existing.id,
          raw: row.raw,
          normalized: { name, capacity },
        });
        continue;
      }

      const teacherResult = await this.resolver.resolveTeacher(
        teacherEmailRaw,
        teacherNameRaw,
      );
      if (!teacherResult.ok) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: teacherResult.reason,
          raw: row.raw,
          normalized: { name, capacity },
        });
        continue;
      }

      const saved = await this.classRepo.save(
        this.classRepo.create({
          name,
          capacity,
          teacherId: teacherResult.entity.id,
        }),
      );

      entries.push({
        rowNumber: row.rowNumber,
        status: 'created',
        reason: 'Created class',
        recordId: saved.id,
        raw: row.raw,
        normalized: {
          name,
          capacity,
          teacherId: teacherResult.entity.id,
        },
      });
    }

    return entries;
  }

  private async importStudents(filePath: string): Promise<RowReportEntry[]> {
    const parsedRows = await this.csvParser.parseFile(filePath);
    const entries: RowReportEntry[] = [];
    const seenEmailsInFile = new Map<string, string>();

    for (const row of parsedRows) {
      const name = this.normalizer.cleanText(
        this.normalizer.pickField(row.raw, ['name', 'student_name', 'full_name']),
      );
      const email = this.normalizer.normalizeEmail(
        this.normalizer.pickField(row.raw, ['email', 'student_email']),
      );
      const classNameRaw = this.normalizer.pickField(row.raw, ['class_name', 'class']);

      if (!name || !email) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: 'Missing required student name or email',
          raw: row.raw,
        });
        continue;
      }

      if (!this.normalizer.isValidEmail(email)) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: `Invalid email format: "${email}"`,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }

      const previousNameInFile = seenEmailsInFile.get(email);
      if (previousNameInFile !== undefined) {
        const isConflict = previousNameInFile.toLowerCase() !== name.toLowerCase();
        entries.push({
          rowNumber: row.rowNumber,
          status: isConflict ? 'rejected' : 'skipped',
          reason: isConflict
            ? `Conflicting duplicate email "${email}" in CSV (previous name: "${previousNameInFile}")`
            : `Duplicate student email "${email}" in CSV`,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }
      seenEmailsInFile.set(email, name);

      const existing = await this.studentRepo
        .createQueryBuilder('s')
        .where('LOWER(s.email) = :email', { email })
        .getOne();

      if (existing) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'skipped',
          reason: `Student with email "${email}" already exists in database`,
          recordId: existing.id,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }

      const classResult = await this.resolver.resolveClass(classNameRaw);
      if (!classResult.ok) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: classResult.reason,
          raw: row.raw,
          normalized: { name, email },
        });
        continue;
      }

      const enrolledCount = await this.studentRepo.count({
        where: { classId: classResult.entity.id },
      });

      if (enrolledCount >= classResult.entity.capacity) {
        entries.push({
          rowNumber: row.rowNumber,
          status: 'rejected',
          reason: `Class "${classResult.entity.name}" is at full capacity (${classResult.entity.capacity})`,
          raw: row.raw,
          normalized: {
            name,
            email,
            classId: classResult.entity.id,
          },
        });
        continue;
      }

      const saved = await this.studentRepo.save(
        this.studentRepo.create({
          name,
          email,
          classId: classResult.entity.id,
        }),
      );

      entries.push({
        rowNumber: row.rowNumber,
        status: 'created',
        reason: 'Created student',
        recordId: saved.id,
        raw: row.raw,
        normalized: {
          name,
          email,
          classId: classResult.entity.id,
        },
      });
    }

    return entries;
  }
}
