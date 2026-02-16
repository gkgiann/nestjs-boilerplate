import { Injectable, ConflictException } from '@nestjs/common';
import { AuthService } from '@modules/auth/auth.service';
import { UsersRepository } from '@modules/users/infra/repositories';
import { CreateUserDto } from '@modules/users/dto';
import { SafeUserEntity } from '@modules/users/domain/entities/user.entity';

/**
 * Caso de Uso: Criar Usuário
 * Lógica de negócio para criar um novo usuário
 */
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(data: CreateUserDto): Promise<SafeUserEntity> {
    // 1. Verificar se o email já existe
    const emailExists = await this.usersRepository.emailExists(data.email);

    if (emailExists) {
      throw new ConflictException('A user with this email already exists');
    }

    // 2. Fazer hash da senha
    const hashedPassword = await this.authService.hashPassword(data.password);

    // 3. Criar usuário
    const user = await this.usersRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    });

    // 4. Retornar usuário sem a senha
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
