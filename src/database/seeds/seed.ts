import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum.js';
import { UserEntity } from '../../users/users.entity.js';
import AppDataSource from '../data-source.js';

interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Demo Admin',
    email: 'admin@school.local',
    password: process.env.SEED_ADMIN_PASSWORD || 'Admin123!',
    role: UserRole.ADMIN,
  },
  {
    name: 'Demo Operator',
    email: 'operator@school.local',
    password: process.env.SEED_OPERATOR_PASSWORD || 'Operator123!',
    role: UserRole.OPERATOR,
  },
  {
    name: 'Demo Teacher',
    email: 'teacher@school.local',
    password: process.env.SEED_TEACHER_PASSWORD || 'Teacher123!',
    role: UserRole.TEACHER,
  },
  {
    name: 'Demo Student',
    email: 'student@school.local',
    password: process.env.SEED_STUDENT_PASSWORD || 'Student123!',
    role: UserRole.STUDENT,
  },
];

async function runSeed() {
  await AppDataSource.initialize();

  try {
    const userRepo = AppDataSource.getRepository(UserEntity);

    for (const account of DEMO_ACCOUNTS) {
      const existing = await userRepo.findOne({
        where: { email: account.email },
      });

      const passwordHash = await bcrypt.hash(account.password, 10);

      if (existing) {
        existing.name = account.name;
        existing.role = account.role;
        existing.passwordHash = passwordHash;
        await userRepo.save(existing);
        console.log(`Updated demo user: ${account.email} (${account.role})`);
      } else {
        const user = userRepo.create({
          name: account.name,
          email: account.email,
          passwordHash,
          role: account.role,
        });
        await userRepo.save(user);
        console.log(`Created demo user: ${account.email} (${account.role})`);
      }
    }
  } finally {
    await AppDataSource.destroy();
  }
}

runSeed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});