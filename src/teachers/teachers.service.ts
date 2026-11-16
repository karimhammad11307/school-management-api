import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { CreateTeacherDto } from './dto/create-teacher.dto.js';
import { UpdateTeacherDto } from './dto/update-teacher.dto.js';
import { TeacherEntity } from './teachers.entity.js';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async create(dto: CreateTeacherDto): Promise<TeacherEntity> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.teacherRepo
      .createQueryBuilder('teacher')
      .where('LOWER(teacher.email) = :email', { email })
      .getOne();

    if (existing) {
      throw new ConflictException(`Teacher with email "${email}" already exists.`);
    }

    const teacher = this.teacherRepo.create({
      name: dto.name.trim(),
      email,
    });
    return this.teacherRepo.save(teacher);
  }

  findAll(): Promise<TeacherEntity[]> {
    return this.teacherRepo.find({
      relations: { classes: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<TeacherEntity> {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: { classes: true },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id "${id}" not found.`);
    }
    return teacher;
  }

  async update(id: string, dto: UpdateTeacherDto): Promise<TeacherEntity> {
    const teacher = await this.findOne(id);

    if (dto.email !== undefined) {
      const email = dto.email.trim().toLowerCase();
      if (email !== teacher.email.toLowerCase()) {
        const duplicate = await this.teacherRepo
          .createQueryBuilder('teacher')
          .where('LOWER(teacher.email) = :email', { email })
          .andWhere('teacher.id != :id', { id })
          .getOne();

        if (duplicate) {
          throw new ConflictException(`Teacher with email "${email}" already exists.`);
        }
      }
      teacher.email = email;
    }

    if (dto.name !== undefined) {
      teacher.name = dto.name.trim();
    }

    return this.teacherRepo.save(teacher);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const teacher = await this.findOne(id);
    const assignedClassesCount = await this.classRepo.count({
      where: { teacherId: teacher.id },
    });

    if (assignedClassesCount > 0) {
      throw new ConflictException(
        `Cannot delete teacher "${teacher.name}" because ${assignedClassesCount} class(es) are still assigned to them.`,
      );
    }

    await this.teacherRepo.remove(teacher);
    return { deleted: true, id };
  }
}
