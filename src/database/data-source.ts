import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import { UserEntity } from '../users/users.entity.js';
import { TeacherEntity } from '../teachers/teachers.entity.js';
import { ClassEntity } from '../classes/classes.entity.js';
import { StudentEntity } from '../students/students.entity.js';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'school_management',
  entities: [UserEntity, TeacherEntity, ClassEntity, StudentEntity],
  migrations: [import.meta.dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
