import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { StudentEntity } from '../students/students.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { CsvParserService } from './csv-parser.service.js';
import { ImportReportService } from './import-report.service.js';
import { ImportsController } from './imports.controller.js';
import { ImportsService } from './imports.service.js';
import { RelationshipResolverService } from './relationship-resolver.service.js';
import { RowNormalizerService } from './row-normalizer.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, ClassEntity, StudentEntity])],
  controllers: [ImportsController],
  providers: [
    ImportsService,
    CsvParserService,
    RowNormalizerService,
    RelationshipResolverService,
    ImportReportService,
  ],
})
export class ImportsModule {}