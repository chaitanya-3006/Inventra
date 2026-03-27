import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  create(username: string, passwordHash: string) {
    const user = this.repo.create({ username, passwordHash, role: 'user' });
    return this.repo.save(user);
  }
}
