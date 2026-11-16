import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentEntity } from './students.entity.js';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentEntity> {
    const email = dto.email.trim().toLowerCase();

    return this.dataSource.transaction(async (manager) => {
      const studentRepo = manager.getRepository(StudentEntity);
      const classRepo = manager.getRepository(ClassEntity);

      const duplicate = await studentRepo
        .createQueryBuilder('student')
        .where('LOWER(student.email) = :email', { email })
        .getOne();

      if (duplicate) {
        throw new ConflictException(`Student with email "${email}" already exists.`);
      }

      const targetClass = await classRepo
        .createQueryBuilder('c')
        .setLock('pessimistic_write')
        .where('c.id = :id', { id: dto.classId })
        .getOne();

      if (!targetClass) {
        throw new NotFoundException(`Class with id "${dto.classId}" not found.`);
      }

      const enrolledCount = await studentRepo.count({
        where: { classId: targetClass.id },
      });

      if (enrolledCount >= targetClass.capacity) {
        throw new ConflictException(
          `Class "${targetClass.name}" is at full capacity (${targetClass.capacity}).`,
        );
      }

      const student = studentRepo.create({
        name: dto.name.trim(),
        email,
        classId: targetClass.id,
      });
      return studentRepo.save(student);
    });
  }

  findAll(): Promise<StudentEntity[]> {
    return this.studentRepo.find({
      relations: { schoolClass: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<StudentEntity> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: { schoolClass: true },
    });
    if (!student) {
      throw new NotFoundException(`Student with id "${id}" not found.`);
    }
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentEntity> {
    return this.dataSource.transaction(async (manager) => {
      const studentRepo = manager.getRepository(StudentEntity);
      const classRepo = manager.getRepository(ClassEntity);

      const student = await studentRepo.findOne({ where: { id } });
      if (!student) {
        throw new NotFoundException(`Student with id "${id}" not found.`);
      }

      if (dto.email !== undefined) {
        const email = dto.email.trim().toLowerCase();
        if (email !== student.email.toLowerCase()) {
          const duplicate = await studentRepo
            .createQueryBuilder('student')
            .where('LOWER(student.email) = :email', { email })
            .andWhere('student.id != :id', { id })
            .getOne();

          if (duplicate) {
            throw new ConflictException(`Student with email "${email}" already exists.`);
          }
        }
        student.email = email;
      }

      if (dto.name !== undefined) {
        student.name = dto.name.trim();
      }

      if (dto.classId !== undefined && dto.classId !== student.classId) {
        const targetClass = await classRepo
          .createQueryBuilder('c')
          .setLock('pessimistic_write')
          .where('c.id = :id', { id: dto.classId })
          .getOne();

        if (!targetClass) {
          throw new NotFoundException(`Class with id "${dto.classId}" not found.`);
        }

        const enrolledCount = await studentRepo.count({
          where: { classId: targetClass.id },
        });

        if (enrolledCount >= targetClass.capacity) {
          throw new ConflictException(
            `Class "${targetClass.name}" is at full capacity (${targetClass.capacity}).`,
          );
        }

        student.classId = targetClass.id;
      }

      return studentRepo.save(student);
    });
  }

  async remove(id: string): Promise<{ deleted: true; id: string }> {
    const student = await this.findOne(id);
    await this.studentRepo.remove(student);
    return { deleted: true, id };
  }
}
