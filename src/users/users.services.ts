import { Injectable } from '@nestjs/common';
import { UserEntity } from './users.entity.js';
import { UsersRepository } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findByEmailWithPassword(email);
  }
}
