import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { UsersRepository } from '@modules/users/infra/repositories';
import { UpdateUserDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * Update User Use Case
 * Business logic for updating an existing user
 */
@Injectable()
export class UpdateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(id: string, data: UpdateUserDto): Promise<SafeUserEntity> {
    // 1. Check if user exists
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // 2. If email is being updated, check if it's already in use
    if (data.email && data.email !== user.email) {
      const emailExists = await this.usersRepository.emailExists(data.email, id);

      if (emailExists) {
        throw new ConflictException('Email already in use by another user');
      }
    }

    // 3. Hash password if it's being updated
    const updateData = { ...data };
    if (data.password) {
      updateData.password = await this.authService.hashPassword(data.password);
    }

    // 4. Update user
    const updatedUser = await this.usersRepository.update(id, updateData);

    // 5. Return user without password
    const { password, ...safeUser } = updatedUser;
    return safeUser;
  }
}
