import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation, 
  UpdateDateColumn,
} from 'typeorm';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { StudentEntity } from '../students/students.entity.js';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  name: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.classes, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Relation<TeacherEntity>;

  @OneToMany(() => StudentEntity, (student) => student.schoolClass)
  students: Relation<StudentEntity>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
