import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from '../students/students.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { ClassEntity } from './classes.entity.js';
import { CreateClassDto } from './dto/create-class.dto.js';
import { UpdateClassDto } from './dto/update-class.dto.js';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
  ) {}

  async create(dto: CreateClassDto): Promise<ClassEntity> {
    const name = dto.name.trim();

    const duplicate = await this.classRepo
      .createQueryBuilder('c')
      .where('LOWER(c.name) = LOWER(:name)', { name })
      .getOne();

    if (duplicate) {
      throw new ConflictException(`Class "${name}" already exists.`);
    }

    const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacherId } });
    if (!teacher) {
      throw new NotFoundException(`Teacher with id "${dto.teacherId}" not found.`);
    }

    const created = this.classRepo.create({
      name,
      capacity: dto.capacity,
      teacherId: teacher.id,
    });
    return this.classRepo.save(created);
  }

  findAll(): Promise<ClassEntity[]> {
    return this.classRepo.find({
      relations: { teacher: true, students: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<ClassEntity> {
    const schoolClass = await this.classRepo.findOne({
      where: { id },
      relations: { teacher: true, students: true },
    });
    if (!schoolClass) {
      throw new NotFoundException(`Class with id "${id}" not found.`);
    }
    return schoolClass;
  }

  async update(id: string, dto: UpdateClassDto): Promise<ClassEntity> {
    const schoolClass = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      const duplicate = await this.classRepo
        .createQueryBuilder('c')
        .where('LOWER(c.name) = LOWER(:name)', { name })
        .andWhere('c.id != :id', { id })
        .getOne();

      if (duplicate) {
        throw new ConflictException(`Class "${name}" already exists.`);
      }
      schoolClass.name = name;
    }

    if (dto.teacherId !== undefined) {
      const teacher = await this.teacherRepo.findOne({ where: { id: dto.teacherId } });
      if (!teacher) {
        throw new NotFoundException(`Teacher with id "${dto.teacherId}" not found.`);
      }
      schoolClass.teacherId = teacher.id;
      schoolClass.teacher = teacher;
    }

    if (dto.capacity !== undefined) {
      const enrolledCount = await this.studentRepo.count({
        where: { classId: schoolClass.id },
      });
      if (dto.capacity < enrolledCount) {
        throw new ConflictException(
          `Cannot reduce capacity to ${dto.capacity} because ${enrolledCount} student(s) are currently enrolled.`,
        );
      }
      schoolClass.capacity = dto.capacity;
    }

    return this.classRepo.save(schoolClass);
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const schoolClass = await this.findOne(id);
    const enrolledCount = await this.studentRepo.count({
      where: { classId: schoolClass.id },
    });

    if (enrolledCount > 0) {
      throw new ConflictException(
        `Cannot delete class "${schoolClass.name}" because ${enrolledCount} student(s) are still enrolled.`,
      );
    }

    await this.classRepo.remove(schoolClass);
    return { deleted: true, id };
  }
}
