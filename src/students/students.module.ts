import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { StudentsController } from './students.controller.js';
import { StudentEntity } from './students.entity.js';
import { StudentsService } from './students.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([StudentEntity, ClassEntity])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
