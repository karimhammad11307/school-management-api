import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { RowNormalizerService } from './row-normalizer.service.js';

export type ResolveResult<T> =
  | { ok: true; entity: T }
  | { ok: false; reason: string };

@Injectable()
export class RelationshipResolverService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    private readonly normalizer: RowNormalizerService,
  ) {}

  async resolveTeacher(
    teacherEmailRaw: string,
    teacherNameRaw: string,
  ): Promise<ResolveResult<TeacherEntity>> {
    const email = this.normalizer.normalizeEmail(teacherEmailRaw);
    const name = this.normalizer.cleanText(teacherNameRaw);

    if (email) {
      const byEmail = await this.teacherRepo
        .createQueryBuilder('t')
        .where('LOWER(t.email) = :email', { email })
        .getOne();

      if (!byEmail) {
        return { ok: false, reason: `Teacher with email "${email}" not found` };
      }
      return { ok: true, entity: byEmail };
    }

    if (name) {
      const matches = await this.teacherRepo
        .createQueryBuilder('t')
        .where('LOWER(t.name) = LOWER(:name)', { name })
        .getMany();

      if (matches.length === 0) {
        return { ok: false, reason: `Teacher "${name}" not found` };
      }
      if (matches.length > 1) {
        return {
          ok: false,
          reason: `Ambiguous teacher name "${name}" matches ${matches.length} records`,
        };
      }
      return { ok: true, entity: matches[0] };
    }

    return { ok: false, reason: 'Missing teacher email and teacher name' };
  }

  async resolveClass(classNameRaw: string): Promise<ResolveResult<ClassEntity>> {
    const className = this.normalizer.cleanText(classNameRaw);
    if (!className) {
      return { ok: false, reason: 'Missing class name' };
    }

    const schoolClass = await this.classRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name: className })
      .getOne();

    if (!schoolClass) {
      return { ok: false, reason: `Class "${className}" not found` };
    }

    return { ok: true, entity: schoolClass };
  }
}