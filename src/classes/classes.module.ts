import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentEntity } from '../students/students.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { ClassesController } from './classes.controller.js';
import { ClassEntity } from './classes.entity.js';
import { ClassesService } from './classes.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity, TeacherEntity, StudentEntity])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}