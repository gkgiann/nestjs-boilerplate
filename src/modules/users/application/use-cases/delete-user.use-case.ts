import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '@modules/users/infra/repositories';

/**
 * Delete User Use Case
 * Business logic for deleting a user (soft delete)
 */
@Injectable()
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<void> {
    // 1. Check if user exists
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. Soft delete user (set isActive = false)
    await this.usersRepository.delete(id);

    // Note: For hard delete, use:
    // await this.usersRepository.hardDelete(id);
  }
}
