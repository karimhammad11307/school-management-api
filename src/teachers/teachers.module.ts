import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from '../classes/classes.entity.js';
import { TeachersController } from './teachers.controller.js';
import { TeacherEntity } from './teachers.entity.js';
import { TeachersService } from './teachers.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity, ClassEntity])],
  controllers: [TeachersController],
  providers: [TeachersService],
  exports: [TeachersService],
})
export class TeachersModule {}
