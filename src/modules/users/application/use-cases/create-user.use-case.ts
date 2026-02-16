import { Injectable, ConflictException } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { UsersRepository } from '@modules/users/infra/repositories';
import { CreateUserDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * Create User Use Case
 * Business logic for creating a new user
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(data: CreateUserDto): Promise<SafeUserEntity> {
    // 1. Check if email already exists
    const emailExists = await this.usersRepository.emailExists(data.email);

    if (emailExists) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Hash password
    const hashedPassword = await this.authService.hashPassword(data.password);

    // 3. Create user
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    // 4. Return user without password
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
