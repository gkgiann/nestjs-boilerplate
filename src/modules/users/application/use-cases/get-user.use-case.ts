import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '@modules/users/infra/repositories';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * Get User Use Case
 * Business logic for retrieving a single user by ID
 */
@Injectable()
export class GetUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<SafeUserEntity> {
    // 1. Find user by ID
    const user = await this.usersRepository.findById(id);

    // 2. Check if user exists
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 3. Return user without password
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
